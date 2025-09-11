<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CityController;
use App\Http\Controllers\ComplaintController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::group([
        'prefix' => 'complaints',
        'as' => 'complaints.',
    ], function () {
        Route::get('/', [ComplaintController::class, 'index'])->name('index');

        Route::get('/create', [ComplaintController::class, 'create'])->name('create');

        Route::post('/create', [ComplaintController::class, 'store'])->name('store');

        Route::get('/single', [ComplaintController::class, 'single'])->name('single');
    });

    Route::group([
        'prefix' => 'cities',
        'as' => 'cities.',
    ], function () {
        Route::get('/', [CityController::class, 'index'])->name('index');
        Route::get('/{city}/neighborhoods', [CityController::class, 'neighborhoods'])->name('neighborhoods');
        Route::get('/{city}/departments', [CityController::class, 'departments'])->name('departments');
    });

    Route::get('/ranking', function () {
        return Inertia::render('ranking/ranking');
    })->name('ranking.index');

    Route::group([
        'prefix' => 'admin',
        'as' => 'admin.',
    ], function () {
        Route::get('/', function () {
            return Inertia::render('admin/index');
        })->name('dashboard');

        Route::group([
            'prefix' => 'solicitations',
            'as' => 'solicitations.',
        ], function () {
            Route::get('/', function () {
                return Inertia::render('admin/solicitations');
            })->name('index');
        });
        
        Route::group([
            'prefix' => 'municipalities',
            'as' => 'municipalities.',
        ], function () {
            Route::get('/', function () {
                return Inertia::render('admin/municipalities');
            })->name('index');
        });

        Route::group([
            'prefix' => 'users',
            'as' => 'users.',
        ], function () {
            Route::get('/', function () {
                return Inertia::render('admin/users');
            })->name('index');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
