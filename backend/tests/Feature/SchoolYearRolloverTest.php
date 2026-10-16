<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\SchoolSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Concerns\AuthenticatesWithJwt;
use Tests\TestCase;

class SchoolYearRolloverTest extends TestCase
{
    use AuthenticatesWithJwt;
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-10-16 10:00:00');
        $this->seed([SchoolSeeder::class, UserSeeder::class]);
        $this->admin = User::where('role', User::ADMIN)->sole();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function classOf(string $schoolYearName, string $className): SchoolClass
    {
        [$grade, $section] = explode('-', $className);

        return SchoolClass::whereHas('schoolYear', fn ($query) => $query->where('name', $schoolYearName))
            ->where('grade', $grade)->where('section', $section)->sole();
    }

    public function test_preview_describes_the_rollover(): void
    {
        $preview = $this->withJwt($this->admin)->getJson('/api/school-years/rollover/preview')->assertOk()->json();

        $this->assertSame('2026/27', $preview['current_school_year']);
        $this->assertSame('2027/28', $preview['next_school_year']);
        $this->assertSame('2027-06-20', $preview['preparation_starts_on']);
        $this->assertFalse($preview['can_rollover']);
        $this->assertCount(13, $preview['promotions']);
        $this->assertSame(['from' => '5-1', 'to' => '6-1', 'students' => 6], $preview['promotions'][0]);
        $this->assertSame(['8-1', '8-2', '8-3'], array_column($preview['graduating'], 'class'));
        $this->assertSame(4, $preview['first_grade_sections']);
    }

    public function test_rollover_is_refused_before_the_preparation_period(): void
    {
        $this->withJwt($this->admin)->postJson('/api/school-years/rollover', ['first_grade_sections' => 4])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('school_year');

        $this->assertSame(1, SchoolYear::count());
    }

    public function test_rollover_promotes_classes_archives_eighth_grade_and_opens_first_grade(): void
    {
        $inactive = $this->classOf('2026/27', '6-2')->enrollments()->first();
        $inactive->update(['status' => Enrollment::INACTIVE]);
        $promotedStudentId = $this->classOf('2026/27', '5-1')->enrollments()->value('student_id');
        $headTeacher = $this->classOf('2026/27', '5-1')->head_teacher_name;

        Carbon::setTestNow('2027-06-25 09:00:00');

        $this->withJwt($this->admin)->postJson('/api/school-years/rollover', ['first_grade_sections' => 3])
            ->assertOk()
            ->assertJsonPath('name', '2027/28');

        $next = SchoolYear::where('is_current', true)->sole();
        $this->assertSame('2027/28', $next->name);
        $this->assertFalse(SchoolYear::where('name', '2026/27')->sole()->is_current);

        $names = $next->schoolClasses()->orderBy('grade')->orderBy('section')->get()->pluck('name')->all();
        $this->assertSame([
            '5-1', '5-2', '5-3',
            '6-1', '6-2', '6-3', '6-4',
            '7-1', '7-2', '7-3', '7-4', '7-5',
            '8-1', '8-2', '8-3', '8-4',
        ], $names);

        $this->assertSame($headTeacher, $this->classOf('2027/28', '6-1')->head_teacher_name);
        $this->assertSame(
            $this->classOf('2027/28', '6-1')->id,
            Enrollment::where('student_id', $promotedStudentId)->where('school_year_id', $next->id)->value('school_class_id'),
        );
        $this->assertSame(2, Enrollment::where('student_id', $promotedStudentId)->count());

        $this->assertSame(19, Student::whereNotNull('archived_at')->count());
        $this->assertNotNull(Student::find($inactive->student_id)->archived_at);
        $this->assertSame(0, Enrollment::where('student_id', $inactive->student_id)->where('school_year_id', $next->id)->count());
        $this->assertSame(0, $this->classOf('2027/28', '5-1')->enrollments()->count());
        $this->assertSame(96 - 19, Enrollment::where('school_year_id', $next->id)->count());
    }

    public function test_rollover_cannot_run_twice(): void
    {
        Carbon::setTestNow('2027-06-25 09:00:00');
        $this->withJwt($this->admin)->postJson('/api/school-years/rollover', ['first_grade_sections' => 4])->assertOk();

        $this->withJwt($this->admin)->postJson('/api/school-years/rollover', ['first_grade_sections' => 4])
            ->assertUnprocessable();

        $this->assertSame(2, SchoolYear::count());
    }

    public function test_command_rolls_over_ended_school_years_once(): void
    {
        Carbon::setTestNow('2027-08-31 23:00:00');
        $this->artisan('school-year:rollover')->expectsOutput('Nema školskih godina za prelazak.')->assertSuccessful();

        Carbon::setTestNow('2027-09-01 00:10:00');
        $this->artisan('school-year:rollover')->expectsOutput('Tekuća školska godina je sada 2027/28.')->assertSuccessful();
        $this->assertSame(4, SchoolYear::where('is_current', true)->sole()->schoolClasses()->where('grade', 5)->count());

        $this->artisan('school-year:rollover')->expectsOutput('Nema školskih godina za prelazak.')->assertSuccessful();
        $this->assertSame(2, SchoolYear::count());
    }

    public function test_archive_lists_graduates(): void
    {
        Carbon::setTestNow('2027-06-25 09:00:00');
        $this->withJwt($this->admin)->postJson('/api/school-years/rollover', ['first_grade_sections' => 4])->assertOk();

        $archive = collect($this->withJwt($this->admin)->postJson('/api/students/archive/list')->assertOk()->json());

        $this->assertCount(18, $archive);
        $this->assertTrue($archive->every(fn ($item) => $item['completed'] && $item['last_school_year'] === '2026/27'));
        $this->assertSame(['8-1', '8-2', '8-3'], $archive->pluck('last_class_name')->unique()->sort()->values()->all());
    }

    public function test_teacher_cannot_use_rollover_or_archive(): void
    {
        $teacher = User::where('role', User::TEACHER)->sole();

        $this->withJwt($teacher)->getJson('/api/school-years/rollover/preview')->assertForbidden();
        $this->withJwt($teacher)->postJson('/api/school-years/rollover', ['first_grade_sections' => 4])->assertForbidden();
        $this->withJwt($teacher)->postJson('/api/students/archive/list')->assertForbidden();
    }

    public function test_current_school_year_reports_the_preparation_period(): void
    {
        $this->withJwt($this->admin)->getJson('/api/school-years/current')->assertJsonPath('in_preparation', false);

        Carbon::setTestNow('2027-07-01');
        $this->withJwt($this->admin)->getJson('/api/school-years/current')
            ->assertJsonPath('in_preparation', true)
            ->assertJsonPath('preparation_starts_on', '2027-06-20');
    }
}
