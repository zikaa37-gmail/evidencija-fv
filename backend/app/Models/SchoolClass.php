<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['school_year_id', 'grade', 'section', 'head_teacher_name', 'head_teacher_phone'])]
class SchoolClass extends Model
{
    public const FIRST_GRADE = 5;

    public const LAST_GRADE = 8;

    protected $appends = ['name'];

    protected function casts(): array
    {
        return [
            'grade' => 'integer',
            'section' => 'integer',
        ];
    }

    protected function name(): Attribute
    {
        return Attribute::get(fn () => "{$this->grade}-{$this->section}");
    }

    public function schoolYear(): BelongsTo
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
