<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\Complaint;

class ComplaintController extends Controller
{
    public function index()
    {
        return Inertia::render('complaints/index-complaints');
    }

    public function create()
    {
        return Inertia::render('complaints/create-complaints');
    }

    public function single()
    {
        return Inertia::render('complaints/single-complaints');
    }
    
    public function store(CreateRequest $request)
    {
        Complaint::create($request->validated());
        return redirect()->back()->with('success', 'Reclamação criada com sucesso');
    }
}
