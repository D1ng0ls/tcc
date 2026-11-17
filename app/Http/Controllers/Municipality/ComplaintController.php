<?php

namespace App\Http\Controllers\Municipality;

use App\Actions\Complaint\EndAction;
use App\Actions\Complaint\StartAction;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\Status;
use App\Support\ComplaintEventLogger;
use App\Support\ComplaintNotifier;
use App\Support\ComplaintPrivacy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    /**
     * Autoriza usando explicitamente o usuário do guard 'municipality'.
     * Sem isso, $this->authorize() usa o guard default ('web') e nega
     * mesmo quando a prefeitura está logada.
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

        // Sem a relação 'user': a prefeitura vê o problema, não quem o reportou (RNF006).
        // Novidade desde a última vez que a prefeitura abriu a reclamação vai para o topo (RF060).
        $query = (clone $base)
            ->with(['status', 'neighborhood', 'department.municipality.city'])
            ->select('complaints.*')
            ->selectRaw(Complaint::municipalityNoveltySql() . ' as has_novelty');

        if ($status = $request->input('status')) {
            $query->where('status_id', (int) $status);
        }

        if ($departmentId = $request->input('department_id')) {
            $query->where('department_id', (int) $departmentId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where('title', 'like', "%{$search}%");
        }

        $complaints = $query->orderByDesc('has_novelty')->orderByDesc('id')->paginate(20)->withQueryString();
        ComplaintPrivacy::hideAuthors($complaints);

        return Inertia::render('complaints/index', [
            'complaints'  => $complaints,
            'stats'       => $stats,
            'departments' => $municipality->departments()->get(),
            'status'      => Status::all(),
            'filters'     => [
                'status'        => $request->input('status'),
                'department_id' => $request->input('department_id'),
                'date_from'     => $request->input('date_from'),
                'date_to'       => $request->input('date_to'),
                'search'        => $request->input('search'),
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
            'department.municipality:id,name,city_id,photo_url',
            'department.municipality.city.state',
            'archives',
            'messages',
            'events',
            'disputes',
        );

        // Abriu a reclamação: o marcador de novidade some para a prefeitura (RF060).
        $complaint->markSeenByMunicipality();

        // A prefeitura atende o problema sem saber quem o reportou: o autor aparece como "Cidadão".
        ComplaintPrivacy::forViewer($complaint);

        return Inertia::render('complaints/show', [
            'complaint' => $complaint,
            // Opções do "Encaminhar para outro departamento".
            'departments' => auth('municipality')->user()->departments()->orderBy('name')->get(['id', 'name', 'description']),
        ]);
    }

    /**
     * Encaminha a reclamação para outro departamento da mesma prefeitura (quando o cidadão
     * escolheu o departamento errado). Fica registrado no histórico e o cidadão é avisado.
     */
    public function changeDepartment(Request $request, Complaint $complaint)
    {
        $this->authorizeAsMunicipality('changeDepartment', $complaint);

        $municipalityId = auth('municipality')->id();
        $request->validate([
            'department_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('departments', 'id')->where('municipality_id', $municipalityId),
                \Illuminate\Validation\Rule::notIn([$complaint->department_id]),
            ],
        ], [
            'department_id.required' => 'Escolha o departamento.',
            'department_id.exists' => 'Departamento inválido.',
            'department_id.not_in' => 'A reclamação já está neste departamento.',
        ]);

        $from = $complaint->department->name;
        $to = Department::find($request->department_id);

        $complaint->update(['department_id' => $to->id]);

        ComplaintEventLogger::log($complaint, 'department_changed', "De \"{$from}\" para \"{$to->name}\".");
        ComplaintNotifier::departmentChanged($complaint, $to->name);

        return redirect()->back()->with('success', "Reclamação encaminhada para {$to->name}.");
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
