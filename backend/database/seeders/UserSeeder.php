<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public const DEV_PASSWORD = 'lozinka123';

    public function run(): void
    {
        $school = School::firstOrFail();

        User::create([
            'school_id' => $school->id,
            'name' => 'Administrator',
            'email' => 'admin@evidencija.test',
            'role' => User::ADMIN,
            'password' => self::DEV_PASSWORD,
        ]);

        User::create([
            'school_id' => $school->id,
            'name' => 'Nastavnik Fizičkog',
            'email' => 'nastavnik@evidencija.test',
            'role' => User::TEACHER,
            'password' => self::DEV_PASSWORD,
        ]);
    }
}
