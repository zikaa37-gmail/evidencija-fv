<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;
use App\Services\CurrentSchoolYear;
use App\Services\SchoolYearRolloverService;
use Illuminate\Http\Request;

class SchoolYearController extends Controller
{
    public function __construct(
        private CurrentSchoolYear $currentSchoolYear,
        private SchoolYearRolloverService $rollover,
    ) {}

    public function current(Request $request)
    {
        return $this->present($this->currentSchoolYear->for($request->user())->load('school'));
    }

    public function rolloverPreview(Request $request)
    {
        return $this->rollover->preview($this->currentSchoolYear->for($request->user()));
    }

    public function rollover(Request $request)
    {
        $data = $request->validate([
            'first_grade_sections' => ['required', 'integer', 'between:0,20'],
        ]);

        $next = $this->rollover->rollover(
            $this->currentSchoolYear->for($request->user()),
            $data['first_grade_sections'],
        );

        return response()->json($this->present($next->load('school')));
    }

    private function present(SchoolYear $schoolYear): array
    {
        return [
            'id' => $schoolYear->id,
            'name' => $schoolYear->name,
            'starts_on' => $schoolYear->starts_on->toDateString(),
            'ends_on' => $schoolYear->ends_on->toDateString(),
            'preparation_starts_on' => $schoolYear->preparationStartsOn()->toDateString(),
            'in_preparation' => $schoolYear->isInPreparation(),
            'edit_window_days' => (int) config('school.edit_window_days'),
            'school' => [
                'id' => $schoolYear->school->id,
                'name' => $schoolYear->school->name,
                'city' => $schoolYear->school->city,
            ],
        ];
    }
}
