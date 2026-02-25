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

    public function show($stateUf, $citySlug)
    {
        $state = State::where('uf', strtoupper($stateUf))->first();
        if (!$state) {
            return redirect()->route('home');
        }

        $city = City::where('slug', $citySlug)->where('state_id', $state->id)->first();
        if (!$city) {
            return redirect()->route('home');
        }

        $departments = $city->municipality->departments()->get();

        $complaints = Complaint::whereIn('department_id', $departments->pluck('id'))
            ->orderBy('id', 'desc')
            ->with(['status', 'neighborhood', 'department.municipality.city', 'user'])
            ->get();

        return Inertia::render('complaints', [
            'complaints' => $complaints,
            'city' => $city->load('state'),
            'ranking' => $city->latestRanking,
            'status' => Status::all(),
            'resolution' => CalcResolutionHelper::calc($complaints),
        ]);
    }

    public function neighborhoods(City $city)
    {
        return response()->json(Neighborhood::where('city_id', $city->id)->get());
    }

    public function departments(City $city)
    {
        return response()->json($city->municipality->departments()->get());
    }
}
