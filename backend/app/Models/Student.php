<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'school_id',
    'first_name',
    'last_name',
    'sex',
    'emergency_contact_name',
    'emergency_contact_phone',
    'sports',
    'health_issues',
    'archived_at',
])]
class Student extends Model
{
    protected function casts(): array
    {
        return [
            'sports' => 'array',
            'health_issues' => 'array',
            'archived_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }
}
