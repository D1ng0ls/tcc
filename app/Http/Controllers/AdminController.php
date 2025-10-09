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

    public function municipalities()
    {
        return Inertia::render('admin/municipalities');
    }

    public function municipalitiesAll(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $search = $request->input('search');

        $municipalities = Municipality::with([
            'city.state',
        ])
            ->withCount(['city as users_count' => function ($query) {
                $query->withCount('users');
            }])
            ->withCount(['departments as complaints_count' => function ($q) {
                $q->join('complaints', 'departments.id', '=', 'complaints.department_id');
            }])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('city', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->paginate(20);

        return response()->json($municipalities);
    }
    
    public function toggle(Municipality $municipality)
    {
        $municipality->update([
            'active' => !$municipality->active
        ]);

        return redirect()->back()->with('success', 'Município ' . ($municipality->active ? 'ativado' : 'desativado') . ' com sucesso');
    }

    public function approve(CityRequest $cityRequest)
    {
        $cityRequest->update([
            'status' => RequestEnum::APPROVED,
        ]);

        return redirect()->back()->with('success', 'Solicitação aprovada com sucesso');
    }

    public function reject(CityRequest $cityRequest)
    {
        $cityRequest->update([
            'status' => RequestEnum::REJECTED,
        ]);

        return redirect()->back()->with('success', 'Solicitação rejeitada com sucesso');
    }
}
