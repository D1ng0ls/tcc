<?php

use App\Http\Controllers\ComplaintDisputeController;
use App\Http\Controllers\ComplaintMessageController;
use App\Http\Controllers\Municipality\AccountController;
use App\Http\Controllers\Municipality\AuthController;
use App\Http\Controllers\Municipality\DepartmentUserController;
use App\Http\Controllers\Municipality\DepartmentController;
use App\Http\Controllers\Municipality\ComplaintController;
use App\Http\Controllers\Municipality\NeighborhoodController;
use App\Http\Controllers\Municipality\DashboardController;
use App\Http\Controllers\Municipality\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain('cid.' . config('app.domain'))->as('municipality.')->group(function () {
    Route::middleware('panel.guest:municipality,department')->group(function () {
        Route::get('/', function () {
            return redirect()->route('municipality.login');
        });

        Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
        Route::post('login', [AuthController::class, 'login'])->name('login.post');
    });

    // Master (login da prefeitura) e usuários de departamento.
    Route::middleware(['auth:municipality,department', 'municipality.session'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::patch('notifications/read-all', [DashboardController::class, 'markAllAsRead'])->name('notifications.readAll');
        Route::patch('notifications/{notification}/read', [DashboardController::class, 'markAsRead'])->name('notifications.read');

        Route::group([
            'prefix' => 'complaints',
            'as' => 'complaints.',
        ], function () {
            Route::get('/', [ComplaintController::class, 'index'])->name('index');
            Route::get('/{complaint}', [ComplaintController::class, 'show'])->name('show');
            Route::patch('/{complaint}/start', [ComplaintController::class, 'start'])->name('start');
            Route::patch('/{complaint}/end', [ComplaintController::class, 'end'])->name('end');
            Route::patch('/{complaint}/department', [ComplaintController::class, 'changeDepartment'])->name('department');
            Route::post('/{complaint}/messages', [ComplaintMessageController::class, 'store'])->name('messages.store');
            Route::post('/{complaint}/dispute', [ComplaintDisputeController::class, 'store'])->name('disputes.store');
        });

        // "Minha conta" do usuário de departamento.
        Route::get('account', [AccountController::class, 'edit'])->name('account.edit');
        Route::put('account', [AccountController::class, 'update'])->name('account.update');
        Route::put('account/password', [AccountController::class, 'password'])->name('account.password');
    });

    // Só o master: cadastros da prefeitura.
    Route::middleware(['auth:municipality,department', 'municipality.session', 'panel.master'])->group(function () {
        Route::group([
            'prefix' => 'users',
            'as' => 'users.',
        ], function () {
            Route::get('/', [DepartmentUserController::class, 'index'])->name('index');
            Route::post('/', [DepartmentUserController::class, 'store'])->name('store');
            Route::patch('/{member}', [DepartmentUserController::class, 'update'])->name('update');
            Route::delete('/{member}', [DepartmentUserController::class, 'destroy'])->name('destroy');
        });

        Route::group([
            'prefix' => 'neighborhoods',
            'as' => 'neighborhoods.',
        ], function () {
            Route::get('/', [NeighborhoodController::class, 'index'])->name('index');
            Route::post('/', [NeighborhoodController::class, 'store'])->name('store');
            Route::patch('/{neighborhood}', [NeighborhoodController::class, 'update'])->name('update');
            Route::delete('/{neighborhood}', [NeighborhoodController::class, 'destroy'])->name('destroy');
            Route::patch('/suggestions/{suggestion}/approve', [NeighborhoodController::class, 'approveSuggestion'])->name('suggestions.approve');
            Route::patch('/suggestions/{suggestion}/ignore', [NeighborhoodController::class, 'ignoreSuggestion'])->name('suggestions.ignore');
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
            'prefix' => 'settings',
            'as' => 'settings.',
        ], function () {
            Route::get('/', [ProfileController::class, 'edit'])->name('edit');
            Route::put('/', [ProfileController::class, 'update'])->name('update');
            Route::put('/password', [ProfileController::class, 'password'])->name('password');
            Route::post('/photo', [ProfileController::class, 'uploadPhoto'])->name('photo.upload');
            Route::delete('/photo', [ProfileController::class, 'removePhoto'])->name('photo.remove');
        });
    });
});
