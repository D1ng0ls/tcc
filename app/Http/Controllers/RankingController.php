<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Complaint;
use App\Models\Ranking;
use App\Models\State;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Inertia\Inertia;

class RankingController extends Controller
{
    /**
     * Retorna o (month, year) mais recente disponível na tabela rankings.
     * Garante que mesmo se o cron ainda não rodou no dia/mês atual,
     * o ranking mostrado seja o último período calculado.
     */
    private function latestPeriod(): array
    {
        $latest = Ranking::orderByDesc('year')
            ->orderByDesc('month')
            ->select('month', 'year')
            ->first();

        if (! $latest) {
            return ['month' => (int) date('m'), 'year' => (int) date('Y')];
        }

        return ['month' => (int) $latest->month, 'year' => (int) $latest->year];
    }

    /**
     * Top 5 estados por média de resolução das cidades naquele mês/ano.
     * Usa apenas estados com rankings calculados no período.
     */
    private function topStates(int $month, int $year, int $limit = 5)
    {
        return DB::table('rankings')
            ->join('states', 'rankings.state_id', '=', 'states.id')
            ->where('rankings.month', $month)
            ->where('rankings.year', $year)
            ->whereNotNull('rankings.resolution')
            ->groupBy('states.id', 'states.uf', 'states.name')
            ->selectRaw('states.id, states.uf, states.name')
            ->selectRaw('ROUND(AVG(rankings.resolution), 1) as avg_resolution')
            ->selectRaw('SUM(rankings.total_complaints) as total_complaints')
            ->selectRaw('SUM(rankings.solved_complaints) as solved_complaints')
            ->orderByDesc('avg_resolution')
            ->orderByDesc('total_complaints')
            ->orderBy('states.uf')
            ->take($limit)
            ->get();
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $period = $this->latestPeriod();

        $baseQuery = Ranking::where('month', $period['month'])
            ->where('year', $period['year'])
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
            'top5States' => $this->topStates($period['month'], $period['year']),
            'period' => $period,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function find(Request $request)
    {
        $search = $request->query('search');

        if (!$search) return response()->json(['states' => [], 'cities' => []]);

        $states = State::where('name', 'like', "%{$search}%")
            ->orWhere('uf', 'like', "%{$search}%")
            ->select('id', 'uf', 'name')
            ->limit(2)
            ->get();

        $cities = City::join('states', 'cities.state_id', '=', 'states.id')
            ->where('cities.name', 'like', "%{$search}%")
            ->select('cities.id', 'cities.name', 'cities.slug', 'states.uf')
            ->limit(5)
            ->get();

        return response()->json([
            'states' => $states,
            'cities' => $cities
        ]);
    }

    public function state($stateUf)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();

        if (!$state) {
            return redirect()->route('ranking.index');
        }

        $period = $this->latestPeriod();

        $baseQuery = Ranking::where('month', $period['month'])
            ->where('year', $period['year'])
            ->where('state_id', $state->id)
            ->orderBy('rank_state', 'asc')
            ->with('city.state');

        return Inertia::render('ranking/ranking', [
            'state' => $state,
            'ranking' => (clone $baseQuery)->paginate(10),
            'first5' => (clone $baseQuery)->take(5)->get(),
            'top5States' => $this->topStates($period['month'], $period['year']),
            'period' => $period,
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

        $period = $this->latestPeriod();

        $stateScopedQuery = Ranking::where('month', $period['month'])
            ->where('year', $period['year'])
            ->where('state_id', $state->id)
            ->orderBy('rank_state', 'asc')
            ->with('city.state');

        return Inertia::render('ranking/ranking', [
            'state' => $state,
            'city' => $city,
            'ranking' => Ranking::where('month', $period['month'])
                ->where('year', $period['year'])
                ->where('city_id', $city->id)
                ->orderBy('rank', 'asc')
                ->with('city.state')
                ->paginate(10),
            'first5' => $stateScopedQuery->take(5)->get(),
            'top5States' => $this->topStates($period['month'], $period['year']),
            'period' => $period,
        ]);
    }
}
