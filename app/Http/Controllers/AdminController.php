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
        $users = User::count();
        $complaints = Complaint::count();
        $municipalities = Municipality::where('active', true)->count();
        $cityRequests = CityRequest::where('status', RequestEnum::PENDING)->count();
        $pendingDisputes = \App\Models\ComplaintDispute::where('status', 'pending')->count();
        $pendingDisputesList = \App\Models\ComplaintDispute::where('status', 'pending')
            ->with(['complaint:id,title', 'municipality.city:id,name,state_id', 'municipality.city.state:id,uf'])
            ->orderByDesc('id')
            ->take(5)
            ->get();

        // Crescimento últimos 30 dias
        $since30d = now()->subDays(30);
        $newUsers30d = User::where('created_at', '>=', $since30d)->count();
        $newComplaints30d = Complaint::where('created_at', '>=', $since30d)->count();

        // Distribuição por status (id => count)
        $byStatus = Complaint::selectRaw('status_id, COUNT(*) as total')
            ->groupBy('status_id')
            ->pluck('total', 'status_id')
            ->toArray();

        $statusBuckets = [
            ['id' => \App\ComplaintStatus::OPEN, 'name' => 'Abertas', 'color' => 'bg-blue-500', 'count' => $byStatus[\App\ComplaintStatus::OPEN] ?? 0],
            ['id' => \App\ComplaintStatus::IN_PROGRESS, 'name' => 'Em andamento', 'color' => 'bg-yellow-500', 'count' => $byStatus[\App\ComplaintStatus::IN_PROGRESS] ?? 0],
            ['id' => \App\ComplaintStatus::ENDED, 'name' => 'Aguardando avaliação', 'color' => 'bg-violet-500', 'count' => $byStatus[\App\ComplaintStatus::ENDED] ?? 0],
            ['id' => \App\ComplaintStatus::SOLVED, 'name' => 'Resolvidas', 'color' => 'bg-green-500', 'count' => $byStatus[\App\ComplaintStatus::SOLVED] ?? 0],
            ['id' => \App\ComplaintStatus::REJECTED, 'name' => 'Não resolvidas', 'color' => 'bg-red-500', 'count' => $byStatus[\App\ComplaintStatus::REJECTED] ?? 0],
        ];

        $solved = $byStatus[\App\ComplaintStatus::SOLVED] ?? 0;
        $resolutionRate = $complaints > 0 ? round(($solved / $complaints) * 100, 1) : 0;

        $latest = \App\Models\Ranking::orderByDesc('year')
            ->orderByDesc('month')
            ->select('month', 'year')
            ->first();

        $topCities = collect();
        if ($latest) {
            $topCities = \App\Models\Ranking::where('month', $latest->month)
                ->where('year', $latest->year)
                ->whereNotNull('rank')
                ->with('city.state')
                ->orderBy('rank', 'asc')
                ->take(5)
                ->get();
        }

        // Top 5 estados por número de reclamações
        $topStates = \DB::table('complaints')
            ->join('departments', 'complaints.department_id', '=', 'departments.id')
            ->join('municipalities', 'departments.municipality_id', '=', 'municipalities.id')
            ->join('cities', 'municipalities.city_id', '=', 'cities.id')
            ->join('states', 'cities.state_id', '=', 'states.id')
            ->selectRaw('states.id, states.name, states.uf, COUNT(complaints.id) as total')
            ->groupBy('states.id', 'states.name', 'states.uf')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // Solicitações pendentes (até 5) destacadas
        $pendingRequests = CityRequest::where('status', RequestEnum::PENDING)
            ->with('city.state')
            ->orderByDesc('id')
            ->take(5)
            ->get();

        // Atividade recente
        $recentRequests = CityRequest::with('city.state')
            ->orderByDesc('id')
            ->take(3)
            ->get()
            ->map(fn($r) => [
                'type' => 'city_request',
                'title' => 'Solicitação de acesso para ' . ($r->city->name ?? 'cidade'),
                'subtitle' => ($r->city->state->uf ?? '') . ' • ' . $r->status->value,
                'at' => $r->created_at,
            ]);

        $recentUsers = User::orderByDesc('id')
            ->take(3)
            ->get()
            ->map(fn($u) => [
                'type' => 'user',
                'title' => 'Novo usuário: ' . $u->name,
                'subtitle' => $u->email,
                'at' => $u->created_at,
            ]);

        $recentComplaints = Complaint::with('department.municipality.city')
            ->orderByDesc('id')
            ->take(3)
            ->get()
            ->map(fn($c) => [
                'type' => 'complaint',
                'title' => 'Nova reclamação: ' . $c->title,
                'subtitle' => $c->department->municipality->city->name ?? 'Sem cidade',
                'at' => $c->created_at,
            ]);

        $recentActivity = $recentRequests
            ->concat($recentUsers)
            ->concat($recentComplaints)
            ->sortByDesc('at')
            ->values()
            ->take(8);

        return Inertia::render('admin/index', compact(
            'users',
            'complaints',
            'municipalities',
            'cityRequests',
            'topCities',
            'recentActivity',
            'newUsers30d',
            'newComplaints30d',
            'statusBuckets',
            'resolutionRate',
            'topStates',
            'pendingRequests',
            'pendingDisputes',
            'pendingDisputesList',
        ));
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

    public function municipalities()
    {
        return Inertia::render('admin/municipalities');
    }

    public function municipalitiesAll(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|in:name,status,complaints,users,efficiency',
            'direction' => 'nullable|in:asc,desc',
        ]);

        $search = $request->input('search');
        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $municipalities = Municipality::with(['city.state'])
            ->withCount(['departments as complaints_count' => function ($q) {
                $q->join('complaints', 'departments.id', '=', 'complaints.department_id');
            }])
            ->addSelect([
                'users_count' => \App\Models\User::selectRaw('COUNT(*)')
                    ->whereColumn('users.city_id', 'municipalities.city_id'),
                'efficiency' => \App\Models\Ranking::select('resolution')
                    ->whereColumn('rankings.city_id', 'municipalities.city_id')
                    ->orderByDesc('year')
                    ->orderByDesc('month')
                    ->limit(1),
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('municipalities.name', 'like', "%{$search}%")
                        ->orWhereHas('city', function ($qq) use ($search) {
                            $qq->where('cities.name', 'like', "%{$search}%");
                        });
                });
            });

        switch ($sort) {
            case 'status':
                $municipalities->orderBy('municipalities.active', $direction);
                break;
            case 'complaints':
                $municipalities->orderBy('complaints_count', $direction);
                break;
            case 'users':
                $municipalities->orderBy('users_count', $direction);
                break;
            case 'efficiency':
                // NULL first/last consistente: nulls vão pro final independente da direção
                $municipalities->orderByRaw('efficiency IS NULL')
                    ->orderBy('efficiency', $direction);
                break;
            case 'name':
            default:
                $municipalities->join('cities', 'municipalities.city_id', '=', 'cities.id')
                    ->orderBy('cities.name', $direction)
                    ->select('municipalities.*');
                break;
        }

        return response()->json($municipalities->paginate(20));
    }

    public function toggle(Municipality $municipality)
    {
        $municipality->update([
            'active' => !$municipality->active
        ]);

        return redirect()->back()->with('success', 'Município ' . ($municipality->active ? 'ativado' : 'desativado') . ' com sucesso');
    }

    /**
     * Atualiza email e/ou senha do acesso da prefeitura.
     * - Email pode ser mantido igual (não muda nada relativo a ele).
     * - Senha é opcional; se enviada, usa a política Password::defaults()
     *   (mesma regra do cadastro de usuário: 8+, mixedCase, números, símbolos).
     * - Precisa mudar ao menos um dos dois.
     */
    public function updateMunicipality(Request $request, Municipality $municipality)
    {
        if (! $municipality->active) {
            return redirect()->back()->withErrors([
                'general' => 'Não é possível modificar uma prefeitura inativa. Ative-a primeiro.',
            ]);
        }

        $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('municipalities', 'email')->ignore($municipality->id),
            ],
            'password' => ['nullable', \Illuminate\Validation\Rules\Password::defaults()],
        ], [
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'O e-mail informado não é válido.',
            'email.unique' => 'Este e-mail já está em uso por outra prefeitura.',
        ]);

        $emailChanged = $request->email !== $municipality->email;
        $passwordProvided = $request->filled('password');

        if (! $emailChanged && ! $passwordProvided) {
            return redirect()->back()->withErrors([
                'general' => 'Nenhuma alteração informada. Mude o e-mail ou forneça uma nova senha.',
            ]);
        }

        if ($passwordProvided && \Illuminate\Support\Facades\Hash::check($request->password, $municipality->password)) {
            return redirect()->back()->withErrors([
                'password' => 'A nova senha deve ser diferente da atual.',
            ]);
        }

        $updates = [];
        if ($emailChanged) {
            $updates['email'] = $request->email;
        }
        if ($passwordProvided) {
            $updates['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        // Encerra sessão existente da prefeitura regenerando o remember_token
        $updates['remember_token'] = \Illuminate\Support\Str::random(60);

        $municipality->update($updates);

        return redirect()->back()->with(
            'success',
            'Credenciais atualizadas. A sessão anterior da prefeitura foi encerrada.'
        );
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

    /**
     * Lista de contas de cidadãos (perfil "user") para o painel do administrador,
     * com busca por nome/e-mail e contagem de reclamações.
     */
    public function users(Request $request)
    {
        $request->validate(['search' => 'nullable|string|max:255']);
        $search = $request->input('search');

        $users = User::where('role', 'user')
            ->with('city.state')
            ->withCount('complaints')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Exclui (soft delete) a conta de um cidadão. Não permite excluir
     * administradores.
     */
    public function destroyUser(User $user)
    {
        if ($user->role === 'admin') {
            abort(403, 'Não é permitido excluir contas de administrador.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Conta de cidadão excluída com sucesso.');
    }
}
