<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\City;
use App\Models\Neighborhood;

class CityController extends Controller
{
    public function index()
    {
        return City::all();
    }

    public function neighborhoods(City $city)
    {
        return response()->json(Neighborhood::where('city_id', $city->id)->get());
    }
}
