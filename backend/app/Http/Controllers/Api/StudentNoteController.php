<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\StudentNote;
use App\Services\CurrentSchoolYear;
use App\Services\EditWindow;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudentNoteController extends Controller
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
        ]);

        $studentIds = Enrollment::where('school_year_id', $schoolYear->id)
            ->where('school_class_id', $data['school_class_id'])
            ->pluck('student_id');

        return StudentNote::with(['author', 'schoolYear'])
            ->where('school_year_id', $schoolYear->id)
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (StudentNote $note) => $this->present($note, $request));
    }

    public function store(Request $request)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'date' => $this->editWindow->dateRules($schoolYear),
            'type' => ['required', Rule::in(StudentNote::TYPES)],
            'text' => ['required', 'string', 'max:1000'],
        ]);

        $enrollment = Enrollment::where('school_year_id', $schoolYear->id)
            ->where('student_id', $data['student_id'])
            ->whereHas('student', fn ($query) => $query->whereNull('archived_at'))
            ->firstOrFail();

        $note = StudentNote::create([
            'student_id' => $enrollment->student_id,
            'school_year_id' => $schoolYear->id,
            'date' => $data['date'],
            'type' => $data['type'],
            'text' => trim($data['text']),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($this->present($note->load(['author', 'schoolYear']), $request), 201);
    }

    public function destroy(Request $request, int $id)
    {
        $schoolYear = $this->currentSchoolYear->for($request->user());
        $note = StudentNote::where('school_year_id', $schoolYear->id)->findOrFail($id);

        if (! $this->editWindow->allows($schoolYear, $note->date)) {
            abort(403, 'Napomene starije od '.$this->editWindow->days().' dana su samo za čitanje.');
        }

        if (! $this->canDelete($note, $request)) {
            abort(403, 'Napomenu može da obriše samo autor ili administrator.');
        }

        $note->delete();

        return response()->noContent();
    }

    private function canDelete(StudentNote $note, Request $request): bool
    {
        $isOwnerOrAdmin = $request->user()->isAdmin() || $note->created_by === $request->user()->id;

        return $isOwnerOrAdmin && $this->editWindow->allows($note->schoolYear, $note->date);
    }

    private function present(StudentNote $note, Request $request): array
    {
        return [
            'id' => $note->id,
            'student_id' => $note->student_id,
            'date' => $note->date->toDateString(),
            'type' => $note->type,
            'text' => $note->text,
            'author_name' => $note->author?->name,
            'can_delete' => $this->canDelete($note, $request),
        ];
    }
}
