<?php

use App\Services\SchoolYearRolloverService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('school-year:rollover', function (SchoolYearRolloverService $rollover) {
    $created = $rollover->rolloverEndedYears();

    if ($created->isEmpty()) {
        $this->info('Nema školskih godina za prelazak.');

        return;
    }

    $created->each(fn ($schoolYear) => $this->info("Tekuća školska godina je sada {$schoolYear->name}."));
})->purpose('Prelazak u novu školsku godinu za škole čija je tekuća godina završena');

Schedule::command('school-year:rollover')->yearlyOn(9, 1, '00:10');
