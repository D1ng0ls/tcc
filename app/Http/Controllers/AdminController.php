<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\CityRequest\CreateRequest;
use App\Models\User;
use App\Models\Complaint;
use App\Models\CityRequest;
use App\Models\Municipality;
use App\RequestEnum;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::all()->count();
        $complaints = Complaint::all()->count();
        $municipalities = Municipality::all()->count();
        $cityRequests = CityRequest::all()->count();
        return Inertia::render('admin/index', compact('users', 'complaints', 'municipalities', 'cityRequests'));
    }

    public function solicitation()
    {
        $cityRequests = CityRequest::query()
            ->orderByRaw("CASE status
        WHEN ? THEN 1
        WHEN ? THEN 2
        WHEN ? THEN 3
        END", [
                RequestEnum::PENDING,
                RequestEnum::APPROVED,
                RequestEnum::REJECTED,
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->load('city');
        return Inertia::render('admin/solicitations', compact('cityRequests'));
    }

    public function create()
    {
        return Inertia::render('admin/solicitations/create');
    }

    public function store(CreateRequest $request)
    {
        
    }
}
