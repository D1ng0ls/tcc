<?php

namespace App\Http\Controllers\Municipality;

use App\ComplaintStatus;
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
            ->with(['status', 'neighborhood', 'department.municipality.city'])
            ->get();

        return Inertia::render('municipality/complaints/index', [
            'complaints' => $complaints,
            'departments' => $departments,
            'status' => Status::all(),
        ]);
    }

    public function show(Request $request, Complaint $complaint)
    {
        $this->authorize('view', $complaint);
        $complaint->load('status', 'neighborhood', 'department.municipality.city.state', 'archives', 'department', 'user');
        return Inertia::render('municipality/complaints/show', [
            'complaint' => $complaint,
        ]);
    }

    public function start(Complaint $complaint)
    {
        $this->authorize('start', $complaint);

        $complaint->status_id = ComplaintStatus::IN_PROGRESS;
        $complaint->save();

        return redirect()->route('municipality.complaints.show', $complaint->id)->with('success', 'Reclamação aprovada com sucesso');
    }

    public function end(Complaint $complaint)
    {
        $this->authorize('end', $complaint);

        $complaint->status_id = ComplaintStatus::ENDED;
        $complaint->save();

        return redirect()->route('municipality.complaints.show', $complaint->id)->with('success', 'Reclamação rejeitada com sucesso');
    }
}
