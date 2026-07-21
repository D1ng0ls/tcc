<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ComplaintDisputeController;
use App\Http\Controllers\ComplaintMessageController;
use App\Http\Controllers\Municipality\ComplaintController as MunicipalityComplaintController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\CityRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\WelcomeController;
use App\Models\Complaint;

require __DIR__ . '/municipality.php';

Route::domain(env('APP_DOMAIN'))->group(function () {
    Route::get('/', [WelcomeController::class, 'index'])->name('home');

    Route::group([
        'prefix' => 'ranking',
        'as' => 'ranking.',
    ], function () {
        Route::get('/', [RankingController::class, 'index'])->name('index');
        Route::get('/find', [RankingController::class, 'find'])->name('find');
        Route::get('/{stateUf}', [RankingController::class, 'state'])->name('state');
        Route::get('/{stateUf}/{citySlug}', [RankingController::class, 'city'])->name('city');
    });

    Route::group([
        'prefix' => 'solicitation-form',
        'as' => 'solicitation-form.',
    ], function () {
        Route::get('/', [CityRequestController::class, 'index'])->name('index');
        Route::post('/', [CityRequestController::class, 'store'])->name('store')->middleware('throttle:2,60');
    });

    Route::get('cities/{stateUf}/{citySlug}', [CityController::class, 'show'])->name('cities.show');

    // Single complaint pública (visitantes podem ver). Ações como criar mensagem,
    // contestar, aprovar/rejeitar continuam protegidas dentro do grupo auth abaixo.
    Route::get('/complaints/show/{complaint}', [ComplaintController::class, 'show'])->name('complaints.show');

    Route::middleware(['auth:web', 'verified'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::group(['prefix' => 'notifications', 'as' => 'notifications.'], function () {
            Route::patch('/{notification}/read', [UserNotificationController::class, 'markAsRead'])->name('read');
            Route::patch('/read-all', [UserNotificationController::class, 'markAllAsRead'])->name('readAll');
        });

        Route::group([
            'prefix' => 'complaints',
            'as' => 'complaints.',
        ], function () {
            Route::get('/', [ComplaintController::class, 'index'])->name('index');
            Route::get('/create', [ComplaintController::class, 'create'])->name('create');
            Route::post('/create', [ComplaintController::class, 'store'])->name('store');
            Route::patch('/approve/{complaint}', [ComplaintController::class, 'approve'])->name('approve');
            Route::patch('/reject/{complaint}', [ComplaintController::class, 'reject'])->name('reject');
            Route::patch('/start/{complaint}', [ComplaintController::class, 'start'])->name('start');
            Route::patch('/end/{complaint}', [ComplaintController::class, 'end'])->name('end');
            Route::post('/{complaint}/messages', [ComplaintMessageController::class, 'store'])->name('messages.store');
        });

        Route::delete('/complaint-messages/{message}', [ComplaintMessageController::class, 'destroy'])->name('complaint-messages.destroy');

        Route::group([
            'prefix' => 'cities',
            'as' => 'cities.',
        ], function () {
            Route::get('/{state}', [CityController::class, 'index'])->name('index');
            Route::get('cities/{city}/neighborhoods', [CityController::class, 'neighborhoods'])->name('neighborhoods');
            Route::get('cities/{city}/departments', [CityController::class, 'departments'])->name('departments');
        });

        Route::group([
            'prefix' => 'admin',
            'as' => 'admin.',
            'middleware' => 'admin',
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
                Route::get('/', [ComplaintController::class, 'adminIndex'])->name('index');
                Route::get('/show/{complaint}', [ComplaintController::class, 'show'])->name('show');
            });

            Route::group([
                'prefix' => 'municipalities',
                'as' => 'municipalities.',
            ], function () {
                Route::get('/', [AdminController::class, 'municipalities'])->name('index');
                Route::get('/all', [AdminController::class, 'municipalitiesAll'])->name('all');
                Route::get('/toggle/{municipality}', [AdminController::class, 'toggle'])->name('toggle');
                Route::patch('/{municipality}', [AdminController::class, 'updateMunicipality'])->name('update');
            });

            Route::group([
                'prefix' => 'users',
                'as' => 'users.',
            ], function () {
                Route::get('/', [AdminController::class, 'users'])->name('index');
                Route::delete('/{user}', [AdminController::class, 'destroyUser'])->name('destroy');
            });

            Route::group([
                'prefix' => 'disputes',
                'as' => 'disputes.',
            ], function () {
                Route::get('/', [ComplaintDisputeController::class, 'index'])->name('index');
                Route::patch('/{dispute}/resolve', [ComplaintDisputeController::class, 'resolve'])->name('resolve');
            });
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
