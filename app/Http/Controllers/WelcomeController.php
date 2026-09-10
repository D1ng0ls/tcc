<?php

namespace App\Http\Controllers;

use App\ComplaintStatus;
use App\Models\City;
use App\Models\Complaint;
use App\Models\Ranking;
use App\Models\User;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        $stats = [
            'cities' => City::count(),
            'complaints' => Complaint::count(),
            'resolved' => Complaint::where('status_id', ComplaintStatus::SOLVED)->count(),
            'users' => User::count(),
        ];

        $latest = Ranking::orderByDesc('year')
            ->orderByDesc('month')
            ->select('month', 'year')
            ->first();

        $top3 = collect();
        if ($latest) {
            $top3 = Ranking::where('month', $latest->month)
                ->where('year', $latest->year)
                ->whereNotNull('rank')
                ->orderBy('rank', 'asc')
                ->with('city.state')
                ->take(3)
                ->get();
        }

        return Inertia::render('welcome', [
            'stats' => $stats,
            'top3' => $top3,
        ]);
    }
}
