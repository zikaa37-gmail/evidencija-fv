<?php

use App\Http\Controllers\Api\SchoolYearController;
use Illuminate\Support\Facades\Route;

Route::get('/school-years/current', [SchoolYearController::class, 'current']);
