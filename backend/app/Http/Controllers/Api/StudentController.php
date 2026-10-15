<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Services\CurrentSchoolYear;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentController extends Controller
{
    public function __construct(private CurrentSchoolYear $currentSchoolYear) {}

    public function index(Request $request)
    {
        $data = $request->validate([
            'school_class_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        $schoolYear = $this->currentSchoolYear->for($request->user());

        return $this->enrollmentsQuery($schoolYear)
            ->when($data['school_class_id'] ?? null, fn ($query, $id) => $query->where('school_class_id', $id))
            ->get()
            ->sortBy(fn (Enrollment $enrollment) => [$enrollment->schoolClass->grade, $enrollment->schoolClass->section, $enrollment->student->last_name, $enrollment->student->first_name])
            ->values()
            ->map(fn (Enrollment $enrollment) => $this->present($enrollment));
    }

    public function store(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate($this->rules($schoolYear));

        $enrollment = DB::transaction(function () use ($data, $schoolYear) {
            $student = Student::create([...$this->studentAttributes($data), 'school_id' => $schoolYear->school_id]);

            return $student->enrollments()->create([
                'school_class_id' => $data['school_class_id'],
                'school_year_id' => $schoolYear->id,
                'status' => Enrollment::ACTIVE,
            ]);
        });

        return response()->json($this->present($enrollment->load('student', 'schoolClass')), 201);
    }

    public function update(Request $request, int $id)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $enrollment = $this->findEnrollment($schoolYear, $id);
        $data = $request->validate($this->rules($schoolYear));

        DB::transaction(function () use ($enrollment, $data) {
            $enrollment->student->update($this->studentAttributes($data));
            $enrollment->update(['school_class_id' => $data['school_class_id']]);
        });

        return $this->present($enrollment->fresh(['student', 'schoolClass']));
    }

    public function activate(Request $request, int $id)
    {
        return $this->changeStatus($request, $id, Enrollment::ACTIVE);
    }

    public function deactivate(Request $request, int $id)
    {
        return $this->changeStatus($request, $id, Enrollment::INACTIVE);
    }

    public function destroy(Request $request, int $id)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $this->findEnrollment($schoolYear, $id)->student->delete();

        return response()->noContent();
    }

    public function import(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'students' => ['required', 'array', 'min:1', 'max:1000'],
            'students.*.first_name' => ['required', 'string', 'max:100'],
            'students.*.last_name' => ['required', 'string', 'max:100'],
            'students.*.sex' => ['required', Rule::in(['male', 'female'])],
            'students.*.class_name' => ['required', 'string', 'regex:/^[5-8]-\d{1,2}$/'],
            'students.*.emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'students.*.emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'students.*.sports' => ['nullable', 'array'],
            'students.*.sports.*' => ['string', 'max:50'],
            'students.*.health_issues' => ['nullable', 'array'],
            'students.*.health_issues.*' => ['string', 'max:200'],
        ]);

        $classes = $schoolYear->schoolClasses()->get()->keyBy('name');
        $missing = collect($data['students'])->pluck('class_name')->unique()->reject(fn ($name) => $classes->has($name));

        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'students' => ['Odeljenja ne postoje u tekućoj školskoj godini: '.$missing->sort()->join(', ').'.'],
            ]);
        }

        $summary = DB::transaction(fn () => $this->importRows(collect($data['students']), $classes, $schoolYear));

        return response()->json($summary);
    }

    private function importRows(Collection $rows, Collection $classes, SchoolYear $schoolYear): array
    {
        $created = 0;
        $updated = 0;
        $existing = $this->enrollmentsQuery($schoolYear)->get();

        foreach ($rows as $row) {
            $schoolClass = $classes[$row['class_name']];
            $enrollment = $existing->first(fn (Enrollment $item) => mb_strtolower($item->student->first_name) === mb_strtolower($row['first_name'])
                && mb_strtolower($item->student->last_name) === mb_strtolower($row['last_name']));

            if ($enrollment) {
                $enrollment->student->update($this->studentAttributes($row));
                $enrollment->update(['school_class_id' => $schoolClass->id]);
                $updated++;

                continue;
            }

            $student = Student::create([...$this->studentAttributes($row), 'school_id' => $schoolYear->school_id]);
            $student->enrollments()->create([
                'school_class_id' => $schoolClass->id,
                'school_year_id' => $schoolYear->id,
                'status' => Enrollment::ACTIVE,
            ]);
            $created++;
        }

        return ['created' => $created, 'updated' => $updated];
    }

    private function changeStatus(Request $request, int $id, string $status)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $enrollment = $this->findEnrollment($schoolYear, $id);
        $enrollment->update(['status' => $status]);

        return $this->present($enrollment);
    }

    private function enrollmentsQuery(SchoolYear $schoolYear)
    {
        return Enrollment::with(['student', 'schoolClass'])
            ->where('school_year_id', $schoolYear->id)
            ->whereHas('student', fn ($query) => $query->whereNull('archived_at'));
    }

    private function findEnrollment(SchoolYear $schoolYear, int $studentId): Enrollment
    {
        return $this->enrollmentsQuery($schoolYear)->where('student_id', $studentId)->firstOrFail();
    }

    private function rules(SchoolYear $schoolYear): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'sex' => ['required', Rule::in(['male', 'female'])],
            'school_class_id' => ['required', 'integer', Rule::exists(SchoolClass::class, 'id')->where('school_year_id', $schoolYear->id)],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'sports' => ['nullable', 'array'],
            'sports.*' => ['string', 'max:50'],
            'health_issues' => ['nullable', 'array'],
            'health_issues.*' => ['string', 'max:200'],
        ];
    }

    private function studentAttributes(array $data): array
    {
        return [
            'first_name' => trim($data['first_name']),
            'last_name' => trim($data['last_name']),
            'sex' => $data['sex'],
            'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            'sports' => array_values($data['sports'] ?? []),
            'health_issues' => array_values($data['health_issues'] ?? []),
        ];
    }

    private function present(Enrollment $enrollment): array
    {
        $student = $enrollment->student;
        $schoolClass = $enrollment->schoolClass;

        return [
            'id' => $student->id,
            'first_name' => $student->first_name,
            'last_name' => $student->last_name,
            'sex' => $student->sex,
            'emergency_contact_name' => $student->emergency_contact_name,
            'emergency_contact_phone' => $student->emergency_contact_phone,
            'sports' => $student->sports ?? [],
            'health_issues' => $student->health_issues ?? [],
            'status' => $enrollment->status,
            'school_class_id' => $schoolClass->id,
            'class_name' => $schoolClass->name,
            'head_teacher_name' => $schoolClass->head_teacher_name,
            'head_teacher_phone' => $schoolClass->head_teacher_phone,
        ];
    }
}
