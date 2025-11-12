<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Complaint;
use App\Models\Ranking;
use App\Models\State;
use App\Models\Status;
use Illuminate\Http\Request;

use Inertia\Inertia;

class RankingController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $baseQuery = Ranking::where('month', date('m'))
            ->where('year', date('Y'))
            ->with('city.state')
            ->orderBy('rank', 'asc');

        $paginatedQuery = (clone $baseQuery);

        if ($search) {
            $paginatedQuery->whereHas('city', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('ranking/ranking', [
            'ranking' => $paginatedQuery->paginate(10)->withQueryString(),
            'first5' => (clone $baseQuery)->take(5)->get(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function state($stateUf)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();

        if (!$state) {
            return redirect()->route('ranking.index');
        }

        $baseQuery = Ranking::where('month', date('m'))
            ->where('year', date('Y'))
            ->orderBy('rank', 'asc')
            ->with('city.state');

        $stateQuery = (clone $baseQuery)->where('state_id', $state->id);

        return Inertia::render('ranking/ranking', [
            'state' => $state,
            'ranking' => $stateQuery->paginate(10),
            'first5' => (clone $baseQuery)->take(5)->get(),
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

        $baseQuery = Ranking::where('month', date('m'))
            ->where('year', date('Y'))
            ->orderBy('rank', 'asc');

        return Inertia::render('ranking/ranking', [
            'state' => $state,
            'city' => $city,
            'ranking' => (clone $baseQuery)
                ->where('city_id', $city->id)
                ->with('city.state')
                ->paginate(10),
            'first5' => (clone $baseQuery)
                ->with('city.state')
                ->take(5)
                ->get(),
        ]);
    }
}
