<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentNote;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class AttendanceAndNotesTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $teacher;

    private User $admin;

    private SchoolClass $schoolClass;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-10-16 10:00:00');
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
        $this->teacher = User::where('role', User::TEACHER)->sole();
        $this->admin = User::where('role', User::ADMIN)->sole();
        $this->schoolClass = SchoolClass::where('grade', 5)->where('section', 1)->sole();
        $this->student = $this->schoolClass->enrollments()->first()->student;
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function list(string $from = '2026-10-01', string $to = '2026-10-31'): array
    {
        return $this->withJwt($this->teacher)->postJson('/api/attendance/list', [
            'school_class_id' => $this->schoolClass->id, 'from' => $from, 'to' => $to,
        ])->assertOk()->json();
    }

    public function test_teacher_marks_changes_and_clears_attendance(): void
    {
        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => 'absent'])
            ->assertOk()
            ->assertJson(['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => 'absent']);

        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => 'equipment'])
            ->assertOk();

        $this->assertSame([['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => 'equipment']], $this->list());
        $this->assertSame(1, AttendanceRecord::count());

        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => null])
            ->assertOk()
            ->assertJsonPath('reason', null);
        $this->assertSame([], $this->list());
    }

    public function test_list_includes_the_last_day_of_the_range(): void
    {
        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-16', 'reason' => 'late'])->assertOk();

        $this->assertCount(1, $this->list('2026-10-16', '2026-10-16'));
    }

    public function test_rejects_future_dates_dates_outside_the_year_and_unknown_reasons(): void
    {
        foreach ([['2026-10-17', 'absent'], ['2026-08-31', 'absent'], ['2026-10-15', 'sleepy']] as [$date, $reason]) {
            $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => $date, 'reason' => $reason])
                ->assertUnprocessable();
        }

        $this->assertSame(0, AttendanceRecord::count());
    }

    public function test_only_the_last_seven_days_are_editable(): void
    {
        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-10', 'reason' => 'absent'])
            ->assertOk();
        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-09', 'reason' => 'absent'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date');
        $this->withJwt($this->teacher)->postJson('/api/notes', ['student_id' => $this->student->id, 'date' => '2026-10-09', 'type' => 'good', 'text' => 'Kasno'])
            ->assertUnprocessable();
        $this->withJwt($this->admin)->getJson('/api/school-years/current')->assertJsonPath('edit_window_days', 7);
    }

    public function test_notes_older_than_the_window_are_read_only(): void
    {
        $note = $this->withJwt($this->teacher)->postJson('/api/notes', [
            'student_id' => $this->student->id, 'date' => '2026-10-10', 'type' => 'bad', 'text' => 'Zaboravio opremu',
        ])->assertCreated()->json();

        Carbon::setTestNow('2026-10-17 08:00:00');

        $this->withJwt($this->teacher)->postJson('/api/notes/list', ['school_class_id' => $this->schoolClass->id])
            ->assertJsonPath('0.can_delete', false);
        $this->withJwt($this->admin)->deleteJson("/api/notes/{$note['id']}")->assertForbidden();
        $this->assertSame(1, StudentNote::count());
    }

    public function test_archived_students_cannot_be_marked(): void
    {
        $this->student->update(['archived_at' => now()]);

        $this->withJwt($this->teacher)->putJson('/api/attendance', ['student_id' => $this->student->id, 'date' => '2026-10-15', 'reason' => 'ill'])
            ->assertNotFound();
    }

    public function test_notes_can_be_added_listed_and_deleted_by_author_or_admin(): void
    {
        $note = $this->withJwt($this->teacher)->postJson('/api/notes', [
            'student_id' => $this->student->id, 'date' => '2026-10-15', 'type' => 'good', 'text' => '  Odličan trud na času  ',
        ])->assertCreated()->json();

        $this->assertSame('Odličan trud na času', $note['text']);
        $this->assertSame('Nastavnik Fizičkog', $note['author_name']);
        $this->assertTrue($note['can_delete']);

        $other = User::create(['school_id' => $this->teacher->school_id, 'name' => 'Drugi', 'email' => 'drugi@evidencija.test', 'password' => 'lozinka123', 'role' => User::TEACHER]);
        $this->withJwt($other)->postJson('/api/notes/list', ['school_class_id' => $this->schoolClass->id])
            ->assertOk()
            ->assertJsonPath('0.can_delete', false);
        $this->withJwt($other)->deleteJson("/api/notes/{$note['id']}")->assertForbidden();

        $this->withJwt($this->admin)->deleteJson("/api/notes/{$note['id']}")->assertNoContent();
        $this->assertSame(0, StudentNote::count());
    }

    public function test_note_requires_type_and_text(): void
    {
        $this->withJwt($this->teacher)->postJson('/api/notes', ['student_id' => $this->student->id, 'date' => '2026-10-15', 'type' => 'meh', 'text' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'text']);
    }
}
