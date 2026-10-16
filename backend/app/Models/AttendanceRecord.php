<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'school_year_id', 'school_class_id', 'date', 'reason', 'created_by'])]
class AttendanceRecord extends Model
{
    public const REASONS = ['absent', 'equipment', 'pity', 'late', 'ill'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
