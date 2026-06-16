<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Models\City;
use App\Models\State;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('settings')->group(function () {
        Route::redirect('', 'settings/profile');

        Route::group(['prefix' => 'profile', 'as' => 'profile.'], function () {
            Route::get('/', [ProfileController::class, 'edit'])->name('edit');
            Route::patch('/', [ProfileController::class, 'update'])->name('update');
            Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
            Route::post('/photo', [ProfileController::class, 'uploadPhoto'])->name('photo.upload');
            Route::delete('/photo', [ProfileController::class, 'removePhoto'])->name('photo.remove');
        });

        Route::group(['prefix' => 'address', 'as' => 'address.'], function () {
            Route::get('/', function () {
                return Inertia::render('settings/address', [
                    'states' => State::select('id', 'name', 'uf')->orderBy('name')->get(),
                    'cities' => City::select('id', 'name', 'state_id')->orderBy('name')->get(),
                ]);
            })->name('edit');
            Route::put('/', [ProfileController::class, 'address'])->name('update');
        });

        Route::group(['prefix' => 'password', 'as' => 'password.'], function () {
            Route::get('/', [PasswordController::class, 'edit'])->name('edit');
            Route::put('/', [PasswordController::class, 'update'])->name('update');
        });

        Route::get('/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('appearance');
    });
});
