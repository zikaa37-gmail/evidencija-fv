<?php

namespace App\Services;

use App\Models\SchoolYear;
use Illuminate\Support\Carbon;

class EditWindow
{
    public function days(): int
    {
        return max(1, (int) config('school.edit_window_days'));
    }

    public function firstEditableDate(SchoolYear $schoolYear): Carbon
    {
        $windowStart = Carbon::today()->subDays($this->days() - 1);

        return $windowStart->max($schoolYear->starts_on);
    }

    public function lastEditableDate(SchoolYear $schoolYear): Carbon
    {
        return Carbon::today()->min($schoolYear->ends_on);
    }

    public function dateRules(SchoolYear $schoolYear): array
    {
        return [
            'required',
            'date_format:Y-m-d',
            'after_or_equal:'.$this->firstEditableDate($schoolYear)->toDateString(),
            'before_or_equal:'.$this->lastEditableDate($schoolYear)->toDateString(),
        ];
    }

    public function allows(SchoolYear $schoolYear, Carbon $date): bool
    {
        return $date->betweenIncluded($this->firstEditableDate($schoolYear), $this->lastEditableDate($schoolYear));
    }
}
