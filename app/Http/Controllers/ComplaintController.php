<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\Complaint;
use App\Models\Status;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\ComplaintStatus;

class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = auth()->user()
            ->complaints()
            ->orderBy('id', 'desc')
            ->with(['status', 'neighborhood', 'department.municipality.city'])
            ->get();
        return Inertia::render('complaints/index', [
            'complaints' => $complaints,
            'departments' => $complaints->pluck('department')->unique(),
            'status' => Status::all(),
        ]);
    }

    public function show(Complaint $complaint)
    {
        auth()->user()->can('view', $complaint);
        $complaint->load('status', 'neighborhood', 'department.municipality.city.state', 'archives', 'department');
        return Inertia::render('complaints/show', compact('complaint'));
    }

    public function create()
    {
        return Inertia::render('complaints/create');
    }

    public function store(CreateRequest $request)
    {
        $validated = $request->validated();

        try {
            $complaint = DB::transaction(function () use ($validated, $request) {

                $complaintData = Arr::except($validated, ['images']);
                $complaintData['status_id'] = ComplaintStatus::OPEN;
                $complaint = auth()->user()->complaints()->create($complaintData);

                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $file) {
                        $path = $file->store('complaints', 'public');

                        $fileType = Str::startsWith($file->getClientMimeType(), 'image')
                            ? 'image'
                            : 'video';

                        $complaint->archives()->create([
                            'photo_url' => $path,
                            'type'      => $fileType,
                        ]);
                    }
                }

                return $complaint;
            });

            return redirect()->route('complaints.show', $complaint->id)->with('success', 'Reclamação enviada com sucesso');
        } catch (\Exception $e) {
            return redirect()->route('complaints.create')->with('error', 'Erro ao enviar reclamação: ' . $e->getMessage());
        }
    }

    public function approve(Complaint $complaint)
    {
        if(!auth()->user()->can('approve', $complaint)) {
            return redirect()->route('complaints.show', $complaint->id)->with('error', 'Essa reclamação não pode ser aprovada!');
        }
        $complaint->status_id = ComplaintStatus::SOLVED;
        $complaint->save();
        return redirect()->route('complaints.show', $complaint->id)->with('success', 'Reclamação aprovada com sucesso');
    }

    public function reject(Complaint $complaint)
    {
        if(!auth()->user()->can('reject', $complaint)) {
            return redirect()->route('complaints.show', $complaint->id)->with('error', 'Essa reclamação não pode ser rejeitada!');
        }
        $complaint->status_id = ComplaintStatus::REJECTED;
        $complaint->save();
        return redirect()->route('complaints.show', $complaint->id)->with('success', 'Reclamação rejeitada com sucesso');
    }
}
