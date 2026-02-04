<?php

use App\Http\Controllers\Municipality\AuthController;
use App\Http\Controllers\Municipality\DepartmentController;
use App\Http\Controllers\Municipality\ComplaintController;
use App\Http\Controllers\Municipality\NeighborhoodController;
use App\Http\Controllers\Municipality\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain('cid.' . env('APP_DOMAIN'))->as('municipality.')->group(function () {
    Route::middleware('guest:municipality')->group(function () {
        Route::get('/', function () {
            return redirect()->route('municipality.login');
        });

        Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
        Route::post('login', [AuthController::class, 'login'])->name('login.post');

        Route::get('logout', [AuthController::class, 'logout'])->name('logout');
    });

    Route::middleware('auth:municipality')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::group([
            'prefix' => 'neighborhoods',
            'as' => 'neighborhoods.',
        ], function () {
            Route::get('/', [NeighborhoodController::class, 'index'])->name('index');
            Route::post('/', [NeighborhoodController::class, 'store'])->name('store');
            Route::patch('/{neighborhood}', [NeighborhoodController::class, 'update'])->name('update');
            Route::delete('/{neighborhood}', [NeighborhoodController::class, 'destroy'])->name('destroy');
        });

        Route::group([
            'prefix' => 'departments',
            'as' => 'departments.',
        ], function () {
            Route::get('/', [DepartmentController::class, 'index'])->name('index');
            Route::post('/', [DepartmentController::class, 'store'])->name('store');
            Route::patch('/{department}', [DepartmentController::class, 'update'])->name('update');
            Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy');
        });

        Route::group([
            'prefix' => 'complaints',
            'as' => 'complaints.',
        ], function () {
            Route::get('/', [ComplaintController::class, 'index'])->name('index');
            Route::get('/{complaint}', [ComplaintController::class, 'show'])->name('show');
            Route::patch('/{complaint}/start', [ComplaintController::class, 'start'])->name('start');
            Route::patch('/{complaint}/end', [ComplaintController::class, 'end'])->name('end');
        });
    });
});
