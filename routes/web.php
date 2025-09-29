<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\RankingController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::group([
    'prefix' => 'ranking',
    'as' => 'ranking.',
], function () {
    Route::get('/', [RankingController::class, 'index'])->name('index');
    Route::get('/{stateUf}', [RankingController::class, 'state'])->name('state');
    Route::get('/{stateUf}/{citySlug}', [RankingController::class, 'city'])->name('city');
});

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
        Route::post('/approve/{complaint}', [ComplaintController::class, 'approve'])->name('approve');
        Route::post('/reject/{complaint}', [ComplaintController::class, 'reject'])->name('reject');
        Route::get('/show/{complaint}', [ComplaintController::class, 'show'])->name('show');
    });

    Route::group([
        'prefix' => 'cities',
        'as' => 'cities.',
    ], function () {
        Route::get('/', [CityController::class, 'index'])->name('index');
        Route::get('/{city}/neighborhoods', [CityController::class, 'neighborhoods'])->name('neighborhoods');
        Route::get('/{city}/departments', [CityController::class, 'departments'])->name('departments');
    });

     Route::group([
        'prefix' => 'neighborhoods',
        'as' => 'neighborhoods.',
    ], function () {
        Route::get('/create', function () { 
            // CORREÇÃO: Removido 'admin/' do caminho
            return Inertia::render('neighborhoods/create'); 
        })->name('create');
    });


    Route::group([
        'prefix' => 'admin',
        'as' => 'admin.',
    ], function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');

        Route::group([
            'prefix' => 'solicitations',
            'as' => 'solicitations.',
        ], function () {
            Route::get('/', [AdminController::class, 'solicitation'])->name('index');
            Route::get('/create', [AdminController::class, 'create'])->name('create');
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
