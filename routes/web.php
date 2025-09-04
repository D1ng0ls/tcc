<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
        Route::get('/', function () {
            return Inertia::render('complaints/show-complaints');
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('complaints/create-complaints');
        })->name('create');

        Route::get('/single', function () {
            return Inertia::render('complaints/single-complaints');
        })->name('single');
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
