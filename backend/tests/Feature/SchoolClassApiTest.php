<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class SchoolClassApiTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    private User $teacher;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
        $this->admin = User::where('role', User::ADMIN)->sole();
        $this->teacher = User::where('role', User::TEACHER)->sole();
    }

    public function test_lists_current_year_classes_with_student_counts(): void
    {
        $response = $this->withJwt($this->teacher)->postJson('/api/classes/list')->assertOk();

        $this->assertCount(16, $response->json());
        $this->assertSame('5-1', $response->json('0.name'));
        $this->assertSame(SchoolSeeder::STUDENTS_PER_CLASS, $response->json('0.students_count'));
        $this->assertNotNull($response->json('0.head_teacher_name'));
    }

    public function test_teacher_cannot_sync_classes(): void
    {
        $this->withJwt($this->teacher)->postJson('/api/classes/sync', ['classes' => []])->assertForbidden();
    }

    public function test_sync_adds_new_classes_and_removes_empty_ones(): void
    {
        $empty = SchoolClass::where('grade', 8)->where('section', 3)->sole();
        $empty->enrollments()->each(fn ($enrollment) => $enrollment->student->delete());

        $classes = SchoolClass::all()
            ->reject(fn (SchoolClass $schoolClass) => $schoolClass->is($empty))
            ->map(fn (SchoolClass $schoolClass) => ['grade' => $schoolClass->grade, 'section' => $schoolClass->section])
            ->push(['grade' => 5, 'section' => 5])
            ->values()
            ->all();

        $names = collect($this->withJwt($this->admin)->postJson('/api/classes/sync', ['classes' => $classes])->assertOk()->json())
            ->pluck('name');

        $this->assertTrue($names->contains('5-5'));
        $this->assertFalse($names->contains('8-3'));
    }

    public function test_sync_refuses_to_remove_classes_with_students(): void
    {
        $this->withJwt($this->admin)->postJson('/api/classes/sync', ['classes' => [['grade' => 5, 'section' => 1]]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('classes');

        $this->assertSame(16, SchoolClass::count());
    }
}
