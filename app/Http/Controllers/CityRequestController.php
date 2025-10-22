<?php

namespace App\Http\Controllers;

use App\Http\Requests\CityRequest\CreateRequest;
use App\Models\CityRequest;
use App\RequestEnum;
use Inertia\Inertia;

class CityRequestController extends Controller
{
    public function index()
    {
        return Inertia::render('solicitation-form/index');
    }
    public function store(CreateRequest $request)
    {
        CityRequest::create([
            ...$request->all(),
            'user_id' => auth()->id(),
        ]);
        return redirect()->back()->with('success', 'Solicitação enviada com sucesso!');
    }
}
