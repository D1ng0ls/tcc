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
        return Inertia::render('ranking/ranking', [
            'ranking' => [],
        ]);
    }

    public function state($stateUf)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();
        if (!$state) {
            return redirect()->route('ranking.index');
        }
        return Inertia::render('ranking/ranking', [
            'ranking' => ['state' => $state],
        ]);
    }

    public function city($stateUf, $citySlug)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();
        if (!$state) {
            return redirect()->route('ranking.index');
        }
        $city = City::where('slug', $citySlug)->where('state_id', $state->id)->first();
        if (!$city) {
            return redirect()->route('ranking.state', $stateUf);
        }
        return Inertia::render('ranking/ranking', [
            'ranking' => ['state' => $state, 'city' => $city],
        ]);
    }
}
