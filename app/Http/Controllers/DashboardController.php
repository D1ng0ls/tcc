<?php

namespace App\Http\Controllers;

use App\ComplaintStatus;
use App\Models\Complaint;
use App\Models\Ranking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $userComplaints = Complaint::where('user_id', $user->id);

        $stats = [
            'total' => (clone $userComplaints)->count(),
            'in_progress' => (clone $userComplaints)->whereIn('status_id', [ComplaintStatus::OPEN, ComplaintStatus::IN_PROGRESS])->count(),
            'solved' => (clone $userComplaints)->where('status_id', ComplaintStatus::SOLVED)->count(),
            'awaiting_review' => (clone $userComplaints)->where('status_id', ComplaintStatus::ENDED)->count(),
        ];

        $recent = (clone $userComplaints)
            ->with(['status', 'neighborhood', 'department.municipality.city'])
            ->orderByDesc('id')
            ->take(5)
            ->get();

        $cityRanking = null;
        if ($user->city_id) {
            $latest = Ranking::orderByDesc('year')
                ->orderByDesc('month')
                ->select('month', 'year')
                ->first();

            if ($latest) {
                $cityRanking = Ranking::where('month', $latest->month)
                    ->where('year', $latest->year)
                    ->where('city_id', $user->city_id)
                    ->with('city.state')
                    ->first();
            }
        }

        // Apenas notificações ainda não lidas; ao clicar elas somem da lista.
        $notifications = $user->userNotifications()->whereNull('read_at')->take(10)->get();
        $unreadCount = $user->userNotifications()->whereNull('read_at')->count();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recent' => $recent,
            'cityRanking' => $cityRanking,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }
}
