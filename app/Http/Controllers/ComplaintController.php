<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\Complaint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\ComplaintStatus;

class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = auth()->user()->complaints->load('status', 'neighborhood', 'department.municipality.city');
        return Inertia::render('complaints/index', [
            'complaints' => $complaints,
        ]);
    }

    public function show(Complaint $complaint)
    {
        return Inertia::render('complaints/show', [
            'complaint' => $complaint,
        ]);
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

            return redirect()->back()->with('success', 'Reclamação enviada com sucesso');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao enviar reclamação: ' . $e->getMessage());
        }
    }
}
