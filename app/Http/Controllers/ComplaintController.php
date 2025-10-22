<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Actions\Complaint\ApproveAction;
use App\Actions\Complaint\CreateAction;
use App\Actions\Complaint\RejectAction;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\Complaint;
use App\Models\Status;


class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = [];

        if (auth()->user()->can('viewAny', Complaint::class)) {
            $complaints = Complaint::orderBy('id', 'desc')->with(['status', 'neighborhood', 'department.municipality.city', 'user'])->get();
        } else {
            $complaints = auth()->user()->complaints()->orderBy('id', 'desc')->with(['status', 'neighborhood', 'department.municipality.city'])->get();
        }

        return Inertia::render('complaints/index', [
            'complaints' => $complaints,
            'departments' => $complaints->pluck('department')->unique(),
            'status' => Status::all(),
        ]);
    }

    public function show(Complaint $complaint)
    {
        $this->authorize('view', $complaint);
        $complaint->load('status', 'neighborhood', 'department.municipality.city.state', 'archives', 'department', 'user');
        return Inertia::render('complaints/show', compact('complaint'));
    }

    public function create()
    {
        return Inertia::render('complaints/create');
    }

    public function store(CreateRequest $request, CreateAction $createAction)
    {
        $images = $request->file('images', []);

        try {
            $complaint = $createAction->execute($request, $images, auth()->user());

            return redirect()->route('complaints.show', $complaint->id)->with('success', 'Reclamação enviada com sucesso');
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
}
