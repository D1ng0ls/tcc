<?php

namespace App\Http\Controllers\Municipality;

use App\Actions\Complaint\EndAction;
use App\Actions\Complaint\StartAction;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    /**
     * Autoriza usando explicitamente o usuário do guard 'municipality'.
     * Sem isso, $this->authorize() usa o guard default ('web') e nega
     * mesmo quando a Municipality está logada.
     */
    private function authorizeAsMunicipality(string $ability, Complaint $complaint): void
    {
        $municipality = auth('municipality')->user();
        if (! $municipality || ! Gate::forUser($municipality)->allows($ability, $complaint)) {
            abort(403);
        }
    }

    public function index(Request $request)
    {
        $municipality = auth()->guard('municipality')->user();
        $departmentIds = $municipality->departments()->pluck('id');

        $base = Complaint::whereIn('department_id', $departmentIds);

        $stats = [
            'total' => (clone $base)->count(),
            'open' => (clone $base)->where('status_id', \App\ComplaintStatus::OPEN)->count(),
            'in_progress' => (clone $base)->where('status_id', \App\ComplaintStatus::IN_PROGRESS)->count(),
            'solved' => (clone $base)->where('status_id', \App\ComplaintStatus::SOLVED)->count(),
        ];

        $query = (clone $base)->with(['status', 'neighborhood', 'department.municipality.city', 'user']);

        if ($status = $request->input('status')) {
            $query->where('status_id', (int) $status);
        }

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where('title', 'like', "%{$search}%");
        }

        $complaints = $query->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('complaints/index', [
            'complaints'  => $complaints,
            'stats'       => $stats,
            'departments' => $municipality->departments()->get(),
            'status'      => Status::all(),
            'filters'     => [
                'status' => $request->input('status'),
                'search' => $request->input('search'),
            ],
            'viewMode'    => 'municipality',
        ]);
    }

    public function show(Request $request, Complaint $complaint)
    {
        $this->authorizeAsMunicipality('view', $complaint);
        $complaint->load(
            'status',
            'neighborhood',
            'department.municipality.city.state',
            'archives',
            'department',
            'user',
            'messages',
            'events',
            'disputes',
        );
        return Inertia::render('complaints/show', [
            'complaint' => $complaint,
        ]);
    }

    public function start(Complaint $complaint, StartAction $startAction)
    {
        $this->authorizeAsMunicipality('start', $complaint);

        $startAction->execute($complaint);

        return redirect()->back()->with('info', 'Reclamação iniciada com sucesso');
    }

    public function end(Complaint $complaint, EndAction $endAction)
    {
        $this->authorizeAsMunicipality('end', $complaint);

        $endAction->execute($complaint);

        return redirect()->back()->with('info', 'Reclamação finalizada com sucesso');
    }
}
