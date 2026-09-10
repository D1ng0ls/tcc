<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Actions\Complaint\ApproveAction;
use App\Actions\Complaint\CreateAction;
use App\Actions\Complaint\EndAction;
use App\Actions\Complaint\RejectAction;
use App\Actions\Complaint\StartAction;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\Complaint;
use App\Models\State;
use App\Models\Status;
use Illuminate\Http\Request;


class ComplaintController extends Controller
{
    /**
     * Aplica os filtros de busca/status na query de complaints.
     */
    private function applyFilters($query, Request $request)
    {
        if ($status = $request->input('status')) {
            $query->where('status_id', (int) $status);
        }

        if ($departmentId = $request->input('department_id')) {
            $query->where('department_id', (int) $departmentId);
        }

        if ($cityId = $request->input('city_id')) {
            $query->whereHas('department.municipality', fn ($q) => $q->where('city_id', (int) $cityId));
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

        return $query;
    }

    /**
     * Espelha os filtros aplicados de volta pro frontend (para preservar o estado).
     */
    private function filterState(Request $request): array
    {
        return [
            'status'        => $request->input('status'),
            'department_id' => $request->input('department_id'),
            'city_id'       => $request->input('city_id'),
            'date_from'     => $request->input('date_from'),
            'date_to'       => $request->input('date_to'),
            'search'        => $request->input('search'),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $base = Complaint::where('user_id', $user->id);

        // Stats considera TODAS as complaints do usuário (sem o filtro), pra os cards
        // mostrarem o total real, não só o filtrado.
        $stats = [
            'total' => (clone $base)->count(),
            'open' => (clone $base)->where('status_id', \App\ComplaintStatus::OPEN)->count(),
            'in_progress' => (clone $base)->where('status_id', \App\ComplaintStatus::IN_PROGRESS)->count(),
            'solved' => (clone $base)->where('status_id', \App\ComplaintStatus::SOLVED)->count(),
        ];

        $query = (clone $base)->with(['status', 'neighborhood', 'department.municipality.city', 'user']);
        $this->applyFilters($query, $request);

        $complaints = $query->orderByDesc('id')->paginate(20)->withQueryString();

        // Departamentos que aparecem nas reclamações do próprio cidadão (fonte do filtro).
        $departments = \App\Models\Department::whereIn(
            'id',
            (clone $base)->select('department_id')->distinct()->pluck('department_id')->filter()
        )->orderBy('name')->get(['id', 'name']);

        return Inertia::render('complaints/index', [
            'complaints'  => $complaints,
            'stats'       => $stats,
            'departments' => $departments,
            'status'      => Status::all(),
            'filters'     => $this->filterState($request),
            'viewMode'    => 'mine',
        ]);
    }

    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', Complaint::class);

        $base = Complaint::query();

        $stats = [
            'total' => (clone $base)->count(),
            'open' => (clone $base)->where('status_id', \App\ComplaintStatus::OPEN)->count(),
            'in_progress' => (clone $base)->where('status_id', \App\ComplaintStatus::IN_PROGRESS)->count(),
            'solved' => (clone $base)->where('status_id', \App\ComplaintStatus::SOLVED)->count(),
        ];

        $query = (clone $base)->with(['status', 'neighborhood', 'department.municipality.city', 'user']);
        $this->applyFilters($query, $request);

        $complaints = $query->orderByDesc('id')->paginate(20)->withQueryString();

        // Admin filtra em escala nacional: oferece as cidades que possuem reclamações.
        $cities = \App\Models\City::whereHas('municipality.departments.complaints')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('complaints/index', [
            'complaints'  => $complaints,
            'stats'       => $stats,
            'departments' => collect(),
            'cities'      => $cities,
            'status'      => Status::all(),
            'filters'     => $this->filterState($request),
            'viewMode'    => 'admin',
        ]);
    }

    public function show(Complaint $complaint)
    {
        // Pública: visitantes podem ver a página. Ações (mensagem, contestar,
        // aprovar/rejeitar) têm gates próprios.
        $complaint->load(
            'status',
            'neighborhood',
            'department.municipality.city.state',
            'archives',
            'department',
            'user:id,name', // não vaza CPF/endereço do autor (RNF006/UC011)
            'messages',
            'events',
            'disputes',
        );
        return Inertia::render('complaints/show', compact('complaint'));
    }

    public function create()
    {
        return Inertia::render('complaints/create', [
            'states' => State::select('id', 'name')->get(),
        ]);
    }

    public function store(CreateRequest $request, CreateAction $createAction)
    {
        $images = $request->file('images', []);

        try {
            $createAction->execute($request, $images, $request->user());

            return redirect()->route('complaints.index')->with('success', 'Reclamação enviada com sucesso!');
        } catch (\Exception $e) {
            return redirect()->route('complaints.create')->with('error', 'Erro ao enviar reclamação: ' . $e->getMessage());
        }
    }

    public function approve(Complaint $complaint, ApproveAction $approveAction)
    {
        $this->authorize('approve', $complaint);

        $approveAction->execute($complaint);

        return redirect()->route('complaints.show', $complaint->id)->with('info', 'Reclamação aprovada com sucesso');
    }

    public function reject(Complaint $complaint, RejectAction $rejectAction)
    {
        $this->authorize('reject', $complaint);

        $rejectAction->execute($complaint);

        return redirect()->route('complaints.show', $complaint->id)->with('info', 'Reclamação rejeitada com sucesso');
    }

    /**
     * Start / End usados quando o admin opera pelo domínio principal (tcc.test).
     * A própria action checa role==admin ou status correto. Aqui só validamos
     * a policy via guard web.
     */
    public function start(Complaint $complaint, StartAction $startAction)
    {
        $this->authorize('start', $complaint);
        $startAction->execute($complaint);
        return redirect()->back()->with('info', 'Reclamação iniciada com sucesso');
    }

    public function end(Complaint $complaint, EndAction $endAction)
    {
        $this->authorize('end', $complaint);
        $endAction->execute($complaint);
        return redirect()->back()->with('info', 'Reclamação encerrada com sucesso');
    }
}
