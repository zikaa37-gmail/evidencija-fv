<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable(['school_id', 'name', 'starts_on', 'ends_on', 'is_current'])]
class SchoolYear extends Model
{
    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'is_current' => 'boolean',
        ];
    }

    public static function nameFor(int $startYear): string
    {
        return sprintf('%d/%02d', $startYear, ($startYear + 1) % 100);
    }

    public function preparationStartsOn(): Carbon
    {
        [$month, $day] = array_map('intval', explode('-', config('school.preparation_starts')));

        return Carbon::create($this->ends_on->year, $month, $day)->startOfDay();
    }

    public function isInPreparation(?Carbon $today = null): bool
    {
        $today ??= Carbon::today();

        return $today->betweenIncluded($this->preparationStartsOn(), $this->ends_on);
    }

    public function hasEnded(?Carbon $today = null): bool
    {
        return ($today ?? Carbon::today())->gt($this->ends_on);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
