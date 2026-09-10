<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\CalcResolutionHelper;
use App\Models\City;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\Neighborhood;
use App\Models\State;
use App\Models\Status;
use Inertia\Inertia;

class CityController extends Controller
{
    public function index(State $state)
    {
        return $state->cities()->select('id', 'name')->get();
    }

    public function show(Request $request, $stateUf, $citySlug)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();
        if (!$state) {
            return redirect()->route('home');
        }

        $city = City::where('slug', $citySlug)->where('state_id', $state->id)->first();
        if (!$city) {
            return redirect()->route('home');
        }

        if (! $city->municipality) {
            return redirect()->route('home');
        }

        $departments = $city->municipality->departments()->get();
        $departmentIds = $departments->pluck('id');

        // Paginação (20/pág) — usada na listagem
        $complaintsPaginated = Complaint::whereIn('department_id', $departmentIds)
            ->with(['status', 'neighborhood', 'department.municipality.city', 'user'])
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        // Agregados independentes da página (para os cards do topo)
        $totals = [
            'total' => Complaint::whereIn('department_id', $departmentIds)->count(),
            'open' => Complaint::whereIn('department_id', $departmentIds)->where('status_id', \App\ComplaintStatus::OPEN)->count(),
            'solved' => Complaint::whereIn('department_id', $departmentIds)->where('status_id', \App\ComplaintStatus::SOLVED)->count(),
        ];

        return Inertia::render('complaints', [
            'complaints' => $complaintsPaginated,
            'totals' => $totals,
            'city' => $city->load(['state', 'municipality:id,city_id,name,photo_url,active']),
            'ranking' => $city->latestRanking,
            'status' => Status::all(),
        ]);
    }

    public function neighborhoods(City $city)
    {
        return response()->json(Neighborhood::where('city_id', $city->id)->get());
    }

    public function departments(City $city)
    {
        return response()->json($city->municipality?->departments()->get() ?? []);
    }
}
