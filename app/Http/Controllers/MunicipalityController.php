<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Municipality;

class MunicipalityController extends Controller
{
    public function index()
    {
        return view('municipality.index');
    }

    public function update(Request $request)
    {
        return redirect()->route('municipality.index');
    }
}
