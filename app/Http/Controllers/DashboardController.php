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

        // Novidades (RF060): reclamações do cidadão com notificação ainda não lida. Ao abrir a
        // reclamação as notificações dela ficam lidas e ela sai daqui.
        $withNovelty = (clone $userComplaints)
            ->whereHas('notifications', fn ($q) => $q->where('user_id', $user->id)->whereNull('read_at'));
        $noveltyCount = (clone $withNovelty)->count();
        $novelties = (clone $withNovelty)
            ->orderByDesc('last_activity_at')
            ->take(10)
            ->get(['id', 'title'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'latest_novelty' => $c->notifications()->where('user_id', $user->id)->whereNull('read_at')->latest('id')->value('title'),
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recent' => $recent,
            'cityRanking' => $cityRanking,
            'novelties' => $novelties,
            'noveltyCount' => $noveltyCount,
        ]);
    }
}
