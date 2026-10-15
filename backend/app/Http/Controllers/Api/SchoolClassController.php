<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\CurrentSchoolYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SchoolClassController extends Controller
{
    public function __construct(private CurrentSchoolYear $currentSchoolYear) {}

    public function index(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());

        return $schoolYear->schoolClasses()
            ->withCount(['enrollments as students_count' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('grade')
            ->orderBy('section')
            ->get()
            ->map(fn (SchoolClass $schoolClass) => $this->present($schoolClass));
    }

    public function sync(Request $request)
    {
        $data = $request->validate([
            'classes' => ['present', 'array'],
            'classes.*.grade' => ['required', 'integer', 'between:'.SchoolClass::FIRST_GRADE.','.SchoolClass::LAST_GRADE],
            'classes.*.section' => ['required', 'integer', 'between:1,20'],
        ]);

        $schoolYear = $this->currentSchoolYear->for($request->user());
        $wanted = collect($data['classes'])->map(fn ($item) => "{$item['grade']}-{$item['section']}")->unique();
        $existing = $schoolYear->schoolClasses()->withCount('enrollments')->get()->keyBy('name');

        $toDelete = $existing->reject(fn (SchoolClass $schoolClass) => $wanted->contains($schoolClass->name));
        $blocked = $toDelete->filter(fn (SchoolClass $schoolClass) => $schoolClass->enrollments_count > 0);

        if ($blocked->isNotEmpty()) {
            throw ValidationException::withMessages([
                'classes' => ['Odeljenja sa učenicima ne mogu da se uklone: '.$blocked->keys()->sort()->join(', ').'.'],
            ]);
        }

        DB::transaction(function () use ($schoolYear, $wanted, $existing, $toDelete) {
            $toDelete->each->delete();

            $wanted->reject(fn ($name) => $existing->has($name))->each(function ($name) use ($schoolYear) {
                [$grade, $section] = array_map('intval', explode('-', $name));
                $schoolYear->schoolClasses()->create(['grade' => $grade, 'section' => $section]);
            });
        });

        return $this->index($request);
    }

    private function present(SchoolClass $schoolClass): array
    {
        return [
            'id' => $schoolClass->id,
            'name' => $schoolClass->name,
            'grade' => $schoolClass->grade,
            'section' => $schoolClass->section,
            'head_teacher_name' => $schoolClass->head_teacher_name,
            'head_teacher_phone' => $schoolClass->head_teacher_phone,
            'students_count' => (int) ($schoolClass->students_count ?? 0),
        ];
    }
}
