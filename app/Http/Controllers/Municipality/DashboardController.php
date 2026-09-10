<?php

namespace App\Http\Controllers\Municipality;

use App\ComplaintStatus;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Ranking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $municipality = $request->user('municipality');

        $departmentIds = $municipality->departments()->pluck('id');

        $base = Complaint::whereIn('department_id', $departmentIds);

        $stats = [
            'total' => (clone $base)->count(),
            'open' => (clone $base)->where('status_id', ComplaintStatus::OPEN)->count(),
            'in_progress' => (clone $base)->where('status_id', ComplaintStatus::IN_PROGRESS)->count(),
            'ended' => (clone $base)->where('status_id', ComplaintStatus::ENDED)->count(),
            'solved' => (clone $base)->where('status_id', ComplaintStatus::SOLVED)->count(),
        ];

        $resolutionRate = $stats['total'] > 0
            ? round(($stats['solved'] / $stats['total']) * 100, 1)
            : 0;

        $pendingActions = (clone $base)
            ->where('status_id', ComplaintStatus::OPEN)
            ->with(['neighborhood', 'department', 'user'])
            ->orderByDesc('id')
            ->take(5)
            ->get();

        $byDepartment = (clone $base)
            ->selectRaw('department_id, COUNT(*) as total')
            ->groupBy('department_id')
            ->orderByDesc('total')
            ->with('department:id,name')
            ->take(5)
            ->get();

        $cityRanking = null;
        if ($municipality->city_id) {
            $latest = Ranking::orderByDesc('year')
                ->orderByDesc('month')
                ->select('month', 'year')
                ->first();

            if ($latest) {
                $cityRanking = Ranking::where('month', $latest->month)
                    ->where('year', $latest->year)
                    ->where('city_id', $municipality->city_id)
                    ->with('city.state')
                    ->first();
            }
        }

        return Inertia::render('municipality/dashboard', [
            'stats' => $stats,
            'resolutionRate' => $resolutionRate,
            'pendingActions' => $pendingActions,
            'byDepartment' => $byDepartment,
            'cityRanking' => $cityRanking,
        ]);
    }
}
