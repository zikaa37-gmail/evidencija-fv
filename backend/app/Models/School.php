<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['name', 'city'])]
class School extends Model
{
    public function schoolYears(): HasMany
    {
        return $this->hasMany(SchoolYear::class);
    }

    public function currentSchoolYear(): HasOne
    {
        return $this->hasOne(SchoolYear::class)->where('is_current', true);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
