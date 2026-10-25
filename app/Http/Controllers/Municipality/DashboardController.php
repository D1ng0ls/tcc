<?php

namespace App\Http\Controllers\Municipality;

use App\ComplaintStatus;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\PanelNotification;
use App\Models\Ranking;
use App\Support\ComplaintPrivacy;
use App\Support\Panel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $municipality = Panel::municipality();

        // Master: a prefeitura inteira; usuário de departamento: só o departamento dele.
        $departmentIds = Panel::departmentIds();

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
            ->with(['neighborhood', 'department'])
            ->orderByDesc('id')
            ->take(5)
            ->get();
        ComplaintPrivacy::hideAuthors($pendingActions);

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

        $notifications = self::notificationsQuery()->whereNull('read_at')->orderByDesc('id')->take(10)->get();
        $unreadCount = self::notificationsQuery()->whereNull('read_at')->count();

        return Inertia::render('municipality/dashboard', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'stats' => $stats,
            'resolutionRate' => $resolutionRate,
            'pendingActions' => $pendingActions,
            'byDepartment' => $byDepartment,
            'cityRanking' => $cityRanking,
        ]);
    }

    /** Avisos de quem está logado: os da pessoa do departamento ou, para o master, os da prefeitura. */
    public static function notificationsQuery()
    {
        return PanelNotification::where('municipality_id', Panel::municipality()->id)
            ->where('department_user_id', Panel::member()?->id);
    }

    public function markAsRead(PanelNotification $notification)
    {
        abort_unless(self::notificationsQuery()->whereKey($notification->id)->exists(), 403);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return redirect()->back();
    }

    public function markAllAsRead()
    {
        self::notificationsQuery()->whereNull('read_at')->update(['read_at' => now()]);

        return redirect()->back();
    }
}
