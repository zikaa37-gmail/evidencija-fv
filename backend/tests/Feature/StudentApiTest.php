<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class StudentApiTest extends TestCase
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

    private function classId(string $name): int
    {
        [$grade, $section] = explode('-', $name);

        return SchoolClass::where('grade', $grade)->where('section', $section)->value('id');
    }

    private function payload(array $overrides = []): array
    {
        return [
            'first_name' => 'Novak',
            'last_name' => 'Novaković',
            'sex' => 'male',
            'school_class_id' => $this->classId('5-1'),
            'emergency_contact_name' => 'Majka',
            'emergency_contact_phone' => '061 111 2222',
            'sports' => ['football'],
            'health_issues' => [],
            ...$overrides,
        ];
    }

    public function test_lists_students_of_the_current_year_with_class_data(): void
    {
        $response = $this->withJwt($this->teacher)->postJson('/api/students/list')->assertOk();

        $this->assertCount(96, $response->json());
        $response->assertJsonStructure(['*' => [
            'id', 'first_name', 'last_name', 'sex', 'emergency_contact_name', 'emergency_contact_phone',
            'sports', 'health_issues', 'status', 'school_class_id', 'class_name', 'head_teacher_name', 'head_teacher_phone',
        ]]);
        $this->assertSame('5-1', $response->json('0.class_name'));

        $filtered = $this->withJwt($this->teacher)->postJson('/api/students/list', ['school_class_id' => $this->classId('6-2')])->json();
        $this->assertCount(6, $filtered);
        $this->assertSame(['6-2'], collect($filtered)->pluck('class_name')->unique()->values()->all());
    }

    public function test_archived_students_are_not_listed(): void
    {
        Student::first()->update(['archived_at' => now()]);

        $this->assertCount(95, $this->withJwt($this->teacher)->postJson('/api/students/list')->json());
    }

    public function test_teacher_cannot_change_students(): void
    {
        $this->withJwt($this->teacher)->postJson('/api/students', $this->payload())->assertForbidden();
        $this->withJwt($this->teacher)->patchJson('/api/students/'.Student::first()->id.'/deactivate')->assertForbidden();
    }

    public function test_admin_creates_updates_and_moves_a_student(): void
    {
        $created = $this->withJwt($this->admin)->postJson('/api/students', $this->payload())->assertCreated()->json();

        $this->assertSame('5-1', $created['class_name']);
        $this->assertSame('active', $created['status']);

        $updated = $this->withJwt($this->admin)
            ->putJson("/api/students/{$created['id']}", $this->payload(['school_class_id' => $this->classId('5-2'), 'health_issues' => ['astma']]))
            ->assertOk()
            ->json();

        $this->assertSame('5-2', $updated['class_name']);
        $this->assertSame(['astma'], $updated['health_issues']);
        $this->assertSame(1, Enrollment::where('student_id', $created['id'])->count());
    }

    public function test_rejects_a_class_from_another_school_year(): void
    {
        $this->withJwt($this->admin)->postJson('/api/students', $this->payload(['school_class_id' => 999999]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('school_class_id');
    }

    public function test_deactivate_activate_and_delete(): void
    {
        $id = Student::first()->id;

        $this->withJwt($this->admin)->patchJson("/api/students/{$id}/deactivate")->assertOk()->assertJsonPath('status', 'inactive');
        $this->withJwt($this->admin)->patchJson("/api/students/{$id}/activate")->assertOk()->assertJsonPath('status', 'active');
        $this->withJwt($this->admin)->deleteJson("/api/students/{$id}")->assertNoContent();

        $this->assertNull(Student::find($id));
    }

    public function test_import_creates_new_students_and_updates_existing_ones(): void
    {
        $existing = Enrollment::with('student')->whereHas('schoolClass', fn ($query) => $query->where('grade', 6)->where('section', 1))->first()->student;

        $summary = $this->withJwt($this->admin)->postJson('/api/students/import', ['students' => [
            ['first_name' => 'Petar', 'last_name' => 'Petrović-Novi', 'sex' => 'male', 'class_name' => '5-3', 'sports' => ['handball']],
            ['first_name' => mb_strtoupper($existing->first_name), 'last_name' => $existing->last_name, 'sex' => $existing->sex, 'class_name' => '6-2', 'emergency_contact_phone' => '060 000 0000'],
        ]])->assertOk()->json();

        $this->assertSame(['created' => 1, 'updated' => 1], $summary);
        $this->assertSame('060 000 0000', $existing->fresh()->emergency_contact_phone);
        $this->assertSame(
            $this->classId('6-2'),
            Enrollment::where('student_id', $existing->id)->value('school_class_id'),
        );
    }

    public function test_import_rejects_unknown_classes(): void
    {
        $this->withJwt($this->admin)->postJson('/api/students/import', ['students' => [
            ['first_name' => 'A', 'last_name' => 'B', 'sex' => 'female', 'class_name' => '5-9'],
        ]])->assertUnprocessable()->assertJsonValidationErrors('students');

        $this->assertSame(96, Student::count());
    }
}
