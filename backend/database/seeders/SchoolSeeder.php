<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SchoolSeeder extends Seeder
{
    public const SECTIONS_PER_GRADE = [5 => 4, 6 => 5, 7 => 4, 8 => 3];

    public const STUDENTS_PER_CLASS = 30;

    private const MALE_NAMES = [
        'Marko', 'Nikola', 'Luka', 'Stefan', 'Lazar', 'Filip', 'Vuk', 'Aleksa', 'Pavle', 'Mihajlo',
        'Dušan', 'Ognjen', 'Andrej', 'Petar', 'Uroš', 'Vasilije', 'Nemanja', 'Đorđe', 'Matija', 'Strahinja',
    ];

    private const FEMALE_NAMES = [
        'Ana', 'Milica', 'Jovana', 'Teodora', 'Sara', 'Mila', 'Dunja', 'Katarina', 'Lena', 'Nina',
        'Iva', 'Sofija', 'Anđela', 'Tara', 'Marija', 'Petra', 'Una', 'Lana', 'Hana', 'Vasilija',
    ];

    private const LAST_NAMES = [
        'Petrović', 'Jovanović', 'Nikolić', 'Marković', 'Đorđević', 'Stojanović', 'Ilić', 'Pavlović', 'Kostić', 'Popović',
        'Živković', 'Todorović', 'Mitrović', 'Simić', 'Lukić', 'Stanković', 'Milošević', 'Ristić', 'Kovačević', 'Savić',
        'Lazić', 'Tomić', 'Radović', 'Vasić', 'Babić', 'Marinković', 'Obradović', 'Pešić', 'Janković', 'Božić',
    ];

    private const HEAD_TEACHERS = ['Jelena Radović', 'Zoran Milić', 'Snežana Babić', 'Dragan Tomić', 'Marija Vasić', 'Goran Lazić', 'Ivana Kovačević', 'Branko Savić'];

    private const SPORTS = ['football', 'basketball', 'volleyball', 'handball', 'gymnastics', 'fight'];

    private const HEALTH_ISSUES = ['astma', 'alergija na polen', 'ravni tabani', 'skolioza'];

    private array $availableNames = [];

    public function run(): void
    {
        mt_srand(2026);
        $this->availableNames = [
            'male' => $this->shuffledCombinations(self::MALE_NAMES),
            'female' => $this->shuffledCombinations(self::FEMALE_NAMES),
        ];

        $school = School::create(['name' => 'OŠ „Dositej Obradović"', 'city' => 'Beograd']);
        $schoolYear = $this->createCurrentSchoolYear($school);

        $teacherIndex = 0;
        foreach (self::SECTIONS_PER_GRADE as $grade => $sections) {
            foreach (range(1, $sections) as $section) {
                $schoolClass = $schoolYear->schoolClasses()->create([
                    'grade' => $grade,
                    'section' => $section,
                    'head_teacher_name' => self::HEAD_TEACHERS[$teacherIndex++ % count(self::HEAD_TEACHERS)],
                    'head_teacher_phone' => $this->phone(),
                ]);
                $this->createStudents($school, $schoolYear, $schoolClass);
            }
        }
    }

    private function createCurrentSchoolYear(School $school): SchoolYear
    {
        $today = Carbon::today();
        $startYear = $today->month >= 9 ? $today->year : $today->year - 1;

        return $school->schoolYears()->create([
            'name' => SchoolYear::nameFor($startYear),
            'starts_on' => Carbon::create($startYear, 9, 1),
            'ends_on' => Carbon::create($startYear + 1, 8, 31),
            'is_current' => true,
        ]);
    }

    private function createStudents(School $school, SchoolYear $schoolYear, SchoolClass $schoolClass): void
    {
        foreach (range(1, self::STUDENTS_PER_CLASS) as $index) {
            $sex = $index % 2 === 0 ? 'female' : 'male';
            [$firstName, $lastName] = array_pop($this->availableNames[$sex]);

            $student = Student::create([
                'school_id' => $school->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'sex' => $sex,
                'emergency_contact_name' => 'Roditelj '.$lastName,
                'emergency_contact_phone' => $this->phone(),
                'sports' => mt_rand(0, 2) === 0 ? [] : [$this->pick(self::SPORTS)],
                'health_issues' => mt_rand(0, 4) === 0 ? [$this->pick(self::HEALTH_ISSUES)] : [],
            ]);

            $student->enrollments()->create([
                'school_class_id' => $schoolClass->id,
                'school_year_id' => $schoolYear->id,
                'status' => Enrollment::ACTIVE,
            ]);
        }
    }

    private function shuffledCombinations(array $firstNames): array
    {
        $combinations = [];
        foreach ($firstNames as $firstName) {
            foreach (self::LAST_NAMES as $lastName) {
                $combinations[] = [$firstName, $lastName];
            }
        }

        for ($i = count($combinations) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$combinations[$i], $combinations[$j]] = [$combinations[$j], $combinations[$i]];
        }

        return $combinations;
    }

    private function pick(array $items): string
    {
        return $items[mt_rand(0, count($items) - 1)];
    }

    private function phone(): string
    {
        return sprintf('06%d %03d %04d', mt_rand(0, 9), mt_rand(0, 999), mt_rand(0, 9999));
    }
}
