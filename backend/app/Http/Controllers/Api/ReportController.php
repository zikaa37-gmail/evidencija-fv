<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\StudentNote;
use App\Services\CurrentSchoolYear;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function __construct(private CurrentSchoolYear $currentSchoolYear) {}

    public function schoolClass(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_year_id', $schoolYear->id)],
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $schoolClass = SchoolClass::findOrFail($data['school_class_id']);
        $enrollments = Enrollment::with('student')
            ->where('school_year_id', $schoolYear->id)
            ->where('school_class_id', $schoolClass->id)
            ->whereHas('student', fn ($query) => $query->whereNull('archived_at'))
            ->get()
            ->sortBy(fn (Enrollment $enrollment) => [$enrollment->student->last_name, $enrollment->student->first_name])
            ->values();

        $studentIds = $enrollments->pluck('student_id');

        $attendance = AttendanceRecord::query()
            ->selectRaw('student_id, reason, count(*) as total')
            ->where('school_year_id', $schoolYear->id)
            ->whereIn('student_id', $studentIds)
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to'])
            ->groupBy('student_id', 'reason')
            ->get()
            ->groupBy('student_id');

        $notes = StudentNote::query()
            ->selectRaw('student_id, type, count(*) as total')
            ->where('school_year_id', $schoolYear->id)
            ->whereIn('student_id', $studentIds)
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to'])
            ->groupBy('student_id', 'type')
            ->get()
            ->groupBy('student_id');

        return [
            'class_name' => $schoolClass->name,
            'from' => $data['from'],
            'to' => $data['to'],
            'students' => $enrollments->map(function (Enrollment $enrollment) use ($attendance, $notes) {
                $reasons = collect($attendance->get($enrollment->student_id, []))->pluck('total', 'reason');
                $noteTotals = collect($notes->get($enrollment->student_id, []))->pluck('total', 'type');
                $counts = collect(AttendanceRecord::REASONS)->mapWithKeys(fn ($reason) => [$reason => (int) ($reasons[$reason] ?? 0)]);

                return [
                    'student_id' => $enrollment->student_id,
                    'first_name' => $enrollment->student->first_name,
                    'last_name' => $enrollment->student->last_name,
                    'sex' => $enrollment->student->sex,
                    'photo' => $enrollment->student->photo,
                    'status' => $enrollment->status,
                    ...$counts->all(),
                    'total' => $counts->sum(),
                    'praises' => (int) ($noteTotals['good'] ?? 0),
                    'warnings' => (int) ($noteTotals['bad'] ?? 0),
                ];
            }),
        ];
    }

    public function student(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $enrollment = Enrollment::with(['student', 'schoolClass'])
            ->where('school_year_id', $schoolYear->id)
            ->where('student_id', $data['student_id'])
            ->whereHas('student', fn ($query) => $query->whereNull('archived_at'))
            ->firstOrFail();

        $records = AttendanceRecord::query()
            ->where('school_year_id', $schoolYear->id)
            ->where('student_id', $enrollment->student_id)
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to'])
            ->orderByDesc('date')
            ->get();

        $notes = StudentNote::with('author')
            ->where('school_year_id', $schoolYear->id)
            ->where('student_id', $enrollment->student_id)
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to'])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        $counts = collect(AttendanceRecord::REASONS)
            ->mapWithKeys(fn ($reason) => [$reason => $records->where('reason', $reason)->count()]);

        return [
            'student_id' => $enrollment->student_id,
            'first_name' => $enrollment->student->first_name,
            'last_name' => $enrollment->student->last_name,
            'sex' => $enrollment->student->sex,
            'photo' => $enrollment->student->photo,
            'class_name' => $enrollment->schoolClass->name,
            'from' => $data['from'],
            'to' => $data['to'],
            ...$counts->all(),
            'total' => $counts->sum(),
            'praises' => $notes->where('type', 'good')->count(),
            'warnings' => $notes->where('type', 'bad')->count(),
            'records' => $records->map(fn (AttendanceRecord $record) => [
                'date' => $record->date->toDateString(),
                'reason' => $record->reason,
            ])->values(),
            'notes' => $notes->map(fn (StudentNote $note) => [
                'id' => $note->id,
                'date' => $note->date->toDateString(),
                'type' => $note->type,
                'text' => $note->text,
                'author_name' => $note->author?->name,
            ])->values(),
        ];
    }
}
