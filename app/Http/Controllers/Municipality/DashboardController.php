<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('municipality/dashboard', [
            //todo: colocar os parametros pega ideia no adminController função index
        ]);
    }
}
