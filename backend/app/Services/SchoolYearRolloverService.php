<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SchoolYearRolloverService
{
    public function preview(SchoolYear $current, ?Carbon $today = null): array
    {
        $classes = $current->schoolClasses()
            ->withCount(['enrollments as active_count' => fn ($query) => $query->where('status', Enrollment::ACTIVE)])
            ->withCount(['enrollments as inactive_count' => fn ($query) => $query->where('status', Enrollment::INACTIVE)])
            ->orderBy('grade')
            ->orderBy('section')
            ->get();

        [$promoted, $graduating] = $classes->partition(fn (SchoolClass $schoolClass) => $schoolClass->grade < SchoolClass::LAST_GRADE);

        return [
            'current_school_year' => $current->name,
            'next_school_year' => SchoolYear::nameFor($current->starts_on->year + 1),
            'preparation_starts_on' => $current->preparationStartsOn()->toDateString(),
            'ends_on' => $current->ends_on->toDateString(),
            'can_rollover' => $this->canRollover($current, $today),
            'promotions' => $promoted->values()->map(fn (SchoolClass $schoolClass) => [
                'from' => $schoolClass->name,
                'to' => ($schoolClass->grade + 1).'-'.$schoolClass->section,
                'students' => $schoolClass->active_count,
            ]),
            'graduating' => $graduating->values()->map(fn (SchoolClass $schoolClass) => [
                'class' => $schoolClass->name,
                'students' => $schoolClass->active_count,
            ]),
            'inactive_to_archive' => (int) $classes->sum('inactive_count'),
            'first_grade_sections' => $classes->where('grade', SchoolClass::FIRST_GRADE)->count(),
        ];
    }

    public function canRollover(SchoolYear $current, ?Carbon $today = null): bool
    {
        $today ??= Carbon::today();

        return $today->gte($current->preparationStartsOn());
    }

    public function rollover(SchoolYear $current, int $firstGradeSections, ?Carbon $today = null): SchoolYear
    {
        if (! $current->is_current) {
            throw ValidationException::withMessages(['school_year' => ['Školska godina nije tekuća.']]);
        }

        if (! $this->canRollover($current, $today)) {
            throw ValidationException::withMessages([
                'school_year' => ['Prelazak u novu školsku godinu je moguć od '.$current->preparationStartsOn()->format('d.m.Y').'.'],
            ]);
        }

        return DB::transaction(function () use ($current, $firstGradeSections, $today) {
            $next = $this->createNextYear($current);
            $classes = $current->schoolClasses()->with('enrollments')->get();
            $archivedAt = ($today ?? Carbon::now())->copy();

            foreach ($classes as $schoolClass) {
                $active = $schoolClass->enrollments->where('status', Enrollment::ACTIVE);
                $inactive = $schoolClass->enrollments->where('status', Enrollment::INACTIVE);

                $this->archive($inactive, $archivedAt);

                if ($schoolClass->grade === SchoolClass::LAST_GRADE) {
                    $this->archive($active, $archivedAt);

                    continue;
                }

                $promoted = $next->schoolClasses()->create([
                    'grade' => $schoolClass->grade + 1,
                    'section' => $schoolClass->section,
                    'head_teacher_name' => $schoolClass->head_teacher_name,
                    'head_teacher_phone' => $schoolClass->head_teacher_phone,
                ]);

                $active->each(fn (Enrollment $enrollment) => Enrollment::create([
                    'student_id' => $enrollment->student_id,
                    'school_class_id' => $promoted->id,
                    'school_year_id' => $next->id,
                    'status' => Enrollment::ACTIVE,
                ]));
            }

            foreach (range(1, $firstGradeSections) as $section) {
                $next->schoolClasses()->create(['grade' => SchoolClass::FIRST_GRADE, 'section' => $section]);
            }

            $current->update(['is_current' => false]);
            $next->update(['is_current' => true]);

            return $next;
        });
    }

    public function rolloverEndedYears(?Carbon $today = null): Collection
    {
        return SchoolYear::where('is_current', true)->get()
            ->filter(fn (SchoolYear $schoolYear) => $schoolYear->hasEnded($today))
            ->map(function (SchoolYear $schoolYear) use ($today) {
                $sections = $schoolYear->schoolClasses()->where('grade', SchoolClass::FIRST_GRADE)->count();

                return $this->rollover($schoolYear, $sections, $today);
            })
            ->values();
    }

    private function createNextYear(SchoolYear $current): SchoolYear
    {
        $startYear = $current->starts_on->year + 1;
        $name = SchoolYear::nameFor($startYear);

        if (SchoolYear::where('school_id', $current->school_id)->where('name', $name)->exists()) {
            throw ValidationException::withMessages(['school_year' => ["Školska godina {$name} već postoji."]]);
        }

        return SchoolYear::create([
            'school_id' => $current->school_id,
            'name' => $name,
            'starts_on' => Carbon::create($startYear, 9, 1),
            'ends_on' => Carbon::create($startYear + 1, 8, 31),
            'is_current' => false,
        ]);
    }

    private function archive(Collection $enrollments, Carbon $archivedAt): void
    {
        $studentIds = $enrollments->pluck('student_id');

        if ($studentIds->isNotEmpty()) {
            Student::whereIn('id', $studentIds)->whereNull('archived_at')->update(['archived_at' => $archivedAt]);
        }
    }
}
