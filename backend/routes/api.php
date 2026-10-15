<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SchoolClassController;
use App\Http\Controllers\Api\SchoolYearController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('jwt')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::get('/school-years/current', [SchoolYearController::class, 'current']);
    Route::post('/classes/list', [SchoolClassController::class, 'index']);
    Route::post('/students/list', [StudentController::class, 'index']);
});

Route::middleware(['jwt', 'admin'])->group(function () {
    Route::post('/classes/sync', [SchoolClassController::class, 'sync']);

    Route::post('/students', [StudentController::class, 'store']);
    Route::post('/students/import', [StudentController::class, 'import']);
    Route::put('/students/{id}', [StudentController::class, 'update'])->whereNumber('id');
    Route::patch('/students/{id}/activate', [StudentController::class, 'activate'])->whereNumber('id');
    Route::patch('/students/{id}/deactivate', [StudentController::class, 'deactivate'])->whereNumber('id');
    Route::delete('/students/{id}', [StudentController::class, 'destroy'])->whereNumber('id');
});
