<?php

namespace App\Http\Controllers\Municipality;

use App\Actions\Complaint\EndAction;
use App\Actions\Complaint\StartAction;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    public function index()
    {
        $municipality = auth()->guard('municipality')->user();

        $departments = $municipality->departments()->get();

        $complaints = Complaint::whereIn('department_id', $departments->pluck('id'))
            ->orderBy('id', 'desc')
            ->with(['status', 'neighborhood', 'department.municipality.city', 'user'])
            ->get();

        return Inertia::render('complaints/index', [
            'complaints' => $complaints,
            'departments' => $departments,
            'status' => Status::all(),
        ]);
    }

    public function show(Request $request, Complaint $complaint)
    {
        $this->authorize('view', $complaint);
        $complaint->load('status', 'neighborhood', 'department.municipality.city.state', 'archives', 'department', 'user');
        return Inertia::render('complaints/show', [
            'complaint' => $complaint,
        ]);
    }

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

        return redirect()->back()->with('info', 'Reclamação finalizada com sucesso');
    }
}
