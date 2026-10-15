<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;

class SchoolYearController extends Controller
{
    public function current()
    {
        $schoolYear = SchoolYear::with('school')->where('is_current', true)->firstOrFail();

        return $this->present($schoolYear);
    }

    private function present(SchoolYear $schoolYear): array
    {
        return [
            'id' => $schoolYear->id,
            'name' => $schoolYear->name,
            'starts_on' => $schoolYear->starts_on->toDateString(),
            'ends_on' => $schoolYear->ends_on->toDateString(),
            'school' => [
                'id' => $schoolYear->school->id,
                'name' => $schoolYear->school->name,
                'city' => $schoolYear->school->city,
            ],
        ];
    }
}
