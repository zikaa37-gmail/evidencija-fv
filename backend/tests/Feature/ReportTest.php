<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\SchoolClass;
use App\Models\StudentNote;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    public function test_class_report_sums_attendance_and_notes_per_student_within_the_period(): void
    {
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
        $teacher = User::where('role', User::TEACHER)->sole();
        $schoolClass = SchoolClass::where('grade', 5)->where('section', 1)->sole();
        $enrollment = $schoolClass->enrollments()->first();
        $base = ['student_id' => $enrollment->student_id, 'school_year_id' => $enrollment->school_year_id, 'school_class_id' => $schoolClass->id];

        AttendanceRecord::create([...$base, 'date' => '2026-10-01', 'reason' => 'absent']);
        AttendanceRecord::create([...$base, 'date' => '2026-10-02', 'reason' => 'absent']);
        AttendanceRecord::create([...$base, 'date' => '2026-10-31', 'reason' => 'equipment']);
        AttendanceRecord::create([...$base, 'date' => '2026-11-01', 'reason' => 'late']);
        StudentNote::create(['student_id' => $enrollment->student_id, 'school_year_id' => $enrollment->school_year_id, 'date' => '2026-10-05', 'type' => 'good', 'text' => 'Bravo']);
        StudentNote::create(['student_id' => $enrollment->student_id, 'school_year_id' => $enrollment->school_year_id, 'date' => '2026-10-06', 'type' => 'bad', 'text' => 'Oprema']);

        $report = $this->withJwt($teacher)->postJson('/api/reports/class', [
            'school_class_id' => $schoolClass->id, 'from' => '2026-10-01', 'to' => '2026-10-31',
        ])->assertOk()->json();

        $this->assertSame('5-1', $report['class_name']);
        $this->assertCount(SchoolSeeder::STUDENTS_PER_CLASS, $report['students']);

        $row = collect($report['students'])->firstWhere('student_id', $enrollment->student_id);
        $this->assertSame(
            ['absent' => 2, 'equipment' => 1, 'pity' => 0, 'late' => 0, 'ill' => 0, 'total' => 3, 'praises' => 1, 'warnings' => 1],
            collect($row)->only(['absent', 'equipment', 'pity', 'late', 'ill', 'total', 'praises', 'warnings'])->all(),
        );

        $others = collect($report['students'])->where('student_id', '!=', $enrollment->student_id);
        $this->assertTrue($others->every(fn ($item) => $item['total'] === 0 && $item['praises'] === 0));
    }

    public function test_report_requires_a_class_of_the_current_year_and_a_valid_period(): void
    {
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
        $teacher = User::where('role', User::TEACHER)->sole();

        $this->withJwt($teacher)->postJson('/api/reports/class', ['school_class_id' => 999, 'from' => '2026-10-31', 'to' => '2026-10-01'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['school_class_id', 'to']);
    }
}
