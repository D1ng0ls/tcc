<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\State;
use App\Models\City;
use Inertia\Inertia;

class RankingController extends Controller
{
    public function index()
    {
        return Inertia::render('ranking/ranking');
    }

    public function state($state)
    {
        $state = State::where('uf', $state)->first();
        return Inertia::render('ranking/state', compact('state'));
    }

    public function city($state, $city)
    {
        return view('ranking.city', compact('state', 'city'));
    }
}
