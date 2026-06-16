<?php

namespace App\Http\Controllers;

use App\Http\Requests\CityRequest\CreateRequest;
use App\Models\City;
use App\Models\CityRequest;
use App\Models\State;
use App\RequestEnum;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CityRequestController extends Controller
{
    public function index(Request $request)
    {
        // Pré-preenche (de forma editável) a cidade quando vier via ?city_id=
        $initialCity = null;
        if ($cityId = $request->query('city_id')) {
            $city = City::with('state:id,uf')->find($cityId);
            if ($city) {
                $initialCity = [
                    'id' => $city->id,
                    'name' => $city->name,
                    'uf' => $city->state?->uf,
                    'state_id' => $city->state_id,
                ];
            }
        }

        return Inertia::render('solicitation-form/index', [
            'initialCity' => $initialCity,
            'states' => State::select('id', 'uf', 'name')->orderBy('name')->get(),
        ]);
    }
    public function store(CreateRequest $request)
    {
        CityRequest::create([
            ...$request->all(),
            'user_id' => $request->user()->id,
        ]);
        return redirect()->back()->with('success', 'Solicitação enviada com sucesso!');
    }
}
