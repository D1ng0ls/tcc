<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\Municipality\ComplaintController as MunicipalityComplaintController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\CityRequestController;
use App\Models\Complaint;

require __DIR__ . '/municipality.php';

Route::domain(env('APP_DOMAIN'))->group(function () {
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

    Route::group([
        'prefix' => 'solicitation-form',
        'as' => 'solicitation-form.',
    ], function () {
        Route::get('/', [CityRequestController::class, 'index'])->name('index');
        Route::post('/', [CityRequestController::class, 'store'])->name('store')->middleware('throttle:2,60000');
    });

    Route::get('/complaints22', function () {
        $complaints = Complaint::all();
        return Inertia::render('complaints', compact('complaints'));
    })->name('show');

    Route::middleware(['auth:web', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::group([
            'prefix' => 'complaints',
            'as' => 'complaints.',
        ], function () {
            Route::get('/', [ComplaintController::class, 'index'])->name('index');
            Route::get('/show/{complaint}', [ComplaintController::class, 'show'])->name('show');
            Route::get('/create', [ComplaintController::class, 'create'])->name('create');
            Route::post('/create', [ComplaintController::class, 'store'])->name('store');
            Route::patch('/approve/{complaint}', [ComplaintController::class, 'approve'])->name('approve');
            Route::patch('/reject/{complaint}', [ComplaintController::class, 'reject'])->name('reject');
            Route::patch('/start/{complaint}', [MunicipalityComplaintController::class, 'start'])->name('start');
            Route::patch('/end/{complaint}', [MunicipalityComplaintController::class, 'end'])->name('end');
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
                Route::patch('/approve/{cityRequest}', [AdminController::class, 'approve'])->name('approve');
                Route::patch('/reject/{cityRequest}', [AdminController::class, 'reject'])->name('reject');
            });

            Route::group([
                'prefix' => 'complaints',
                'as' => 'complaints.',
            ], function () {
                Route::get('/', [ComplaintController::class, 'index'])->name('index');
                Route::get('/show/{complaint}', [ComplaintController::class, 'show'])->name('show');
            });

            Route::group([
                'prefix' => 'municipalities',
                'as' => 'municipalities.',
            ], function () {
                Route::get('/', [AdminController::class, 'municipalities'])->name('index');
                Route::get('/all', [AdminController::class, 'municipalitiesAll'])->name('all');
                Route::get('/toggle/{municipality}', [AdminController::class, 'toggle'])->name('toggle');
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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
