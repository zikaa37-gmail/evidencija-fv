<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Services\CurrentSchoolYear;
use App\Services\EditWindow;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function __construct(
        private CurrentSchoolYear $currentSchoolYear,
        private EditWindow $editWindow,
    ) {}

    public function index(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')->where('school_year_id', $schoolYear->id)],
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        return AttendanceRecord::where('school_year_id', $schoolYear->id)
            ->where('school_class_id', $data['school_class_id'])
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to'])
            ->orderBy('date')
            ->get()
            ->map(fn (AttendanceRecord $record) => $this->present($record));
    }

    public function save(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'date' => $this->editWindow->dateRules($schoolYear),
            'reason' => ['present', 'nullable', Rule::in(AttendanceRecord::REASONS)],
        ]);

        $enrollment = Enrollment::where('school_year_id', $schoolYear->id)
            ->where('student_id', $data['student_id'])
            ->whereHas('student', fn ($query) => $query->whereNull('archived_at'))
            ->firstOrFail();

        if ($data['reason'] === null) {
            AttendanceRecord::where('student_id', $enrollment->student_id)->whereDate('date', $data['date'])->delete();

            return ['student_id' => $enrollment->student_id, 'date' => $data['date'], 'reason' => null];
        }

        $record = AttendanceRecord::where('student_id', $enrollment->student_id)->whereDate('date', $data['date'])->first()
            ?? new AttendanceRecord(['student_id' => $enrollment->student_id, 'date' => $data['date']]);

        $record->fill([
            'school_year_id' => $schoolYear->id,
            'school_class_id' => $enrollment->school_class_id,
            'reason' => $data['reason'],
            'created_by' => $request->user()->id,
        ])->save();

        return $this->present($record);
    }

    private function present(AttendanceRecord $record): array
    {
        return [
            'student_id' => $record->student_id,
            'date' => $record->date->toDateString(),
            'reason' => $record->reason,
        ];
    }
}
