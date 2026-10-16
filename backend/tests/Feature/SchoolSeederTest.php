<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class SchoolSeederTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SchoolSeeder::class);
    }

    public function test_seeds_requested_classes_for_the_current_school_year(): void
    {
        $schoolYear = SchoolYear::where('is_current', true)->sole();

        $names = $schoolYear->schoolClasses()->orderBy('grade')->orderBy('section')->get()->pluck('name')->all();

        $this->assertSame([
            '5-1', '5-2', '5-3', '5-4',
            '6-1', '6-2', '6-3', '6-4', '6-5',
            '7-1', '7-2', '7-3', '7-4',
            '8-1', '8-2', '8-3',
        ], $names);
    }

    public function test_every_class_has_the_configured_number_of_students_with_unique_names(): void
    {
        $this->assertSame(
            [SchoolSeeder::STUDENTS_PER_CLASS],
            SchoolClass::withCount('enrollments')->get()->pluck('enrollments_count')->unique()->values()->all(),
        );
        $this->assertSame(
            Student::count(),
            Student::all()->map(fn (Student $student) => "{$student->first_name} {$student->last_name}")->unique()->count(),
        );
    }

    public function test_every_student_is_enrolled_once_in_the_current_school_year(): void
    {
        $schoolYear = SchoolYear::where('is_current', true)->sole();

        $this->assertSame(Student::count(), Enrollment::where('school_year_id', $schoolYear->id)->distinct('student_id')->count());
        $this->assertSame(0, SchoolClass::whereDoesntHave('enrollments')->count());
    }

    public function test_current_school_year_endpoint(): void
    {
        $this->getJson('/api/school-years/current')->assertUnauthorized();

        $user = User::create([
            'school_id' => SchoolYear::where('is_current', true)->value('school_id'),
            'name' => 'Test',
            'email' => 'test@evidencija.test',
            'password' => 'lozinka123',
        ]);

        $this->withJwt($user)->getJson('/api/school-years/current')
            ->assertOk()
            ->assertJsonStructure(['id', 'name', 'starts_on', 'ends_on', 'school' => ['id', 'name', 'city']])
            ->assertJsonPath('school.city', 'Beograd');
    }
}
