<?php

namespace App\Services;

use App\Models\SchoolYear;
use App\Models\User;

class CurrentSchoolYear
{
    public function for(User $user): SchoolYear
    {
        $schoolYear = SchoolYear::where('school_id', $user->school_id)->where('is_current', true)->first();

        if (! $schoolYear) {
            abort(409, 'Za školu nije postavljena tekuća školska godina.');
        }

        return $schoolYear;
    }
}
