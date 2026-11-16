<?php

namespace App\Http\Controllers;

use App\ComplaintStatus;
use App\Models\Complaint;
use App\Models\ComplaintDispute;
use App\Support\ComplaintEventLogger;
use App\Support\ComplaintNotifier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplaintDisputeController extends Controller
{
    /**
     * Contestação: a Prefeitura (do departamento da complaint) abre o pedido
     * de revisão ao administrador depois que o cidadão marcou como
     * NÃO resolvida.
     */
    public function store(Request $request, Complaint $complaint)
    {
        $municipality = auth('municipality')->user();
        if (! $municipality) {
            abort(403, 'Apenas a prefeitura pode abrir uma contestação.');
        }

        $complaint->loadMissing('department');
        if (! $complaint->department || $complaint->department->municipality_id !== $municipality->id) {
            abort(403, 'Esta reclamação não pertence à sua prefeitura.');
        }

        if ($complaint->status_id !== ComplaintStatus::REJECTED) {
            abort(422, 'Só é possível contestar reclamações marcadas como não resolvidas pelo cidadão.');
        }

        if ($complaint->disputes()->where('status', 'pending')->exists()) {
            return redirect()->back()->with('info', 'Já existe uma contestação em análise para esta reclamação.');
        }

        // Se o admin já ignorou definitivamente alguma contestação anterior,
        // a decisão é final — não permite nova tentativa.
        if ($complaint->disputes()->where('status', 'ignored')->exists()) {
            return redirect()->back()->with('info', 'O administrador já decidiu manter esta reclamação como não resolvida. Não é possível contestar novamente.');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $complaint->disputes()->create([
            'municipality_id' => $municipality->id,
            'reason' => $request->input('reason'),
            'status' => 'pending',
        ]);

        ComplaintEventLogger::log($complaint, 'dispute_opened', $request->input('reason'));
        ComplaintNotifier::disputeOpened($complaint);

        return redirect()->back()->with('success', 'Contestação enviada para análise do administrador.');
    }

    /**
     * Lista de contestações pendentes para o admin.
     */
    public function index(Request $request)
    {
        if (auth('web')->user()?->role !== 'admin') {
            abort(403);
        }

        $disputes = ComplaintDispute::with([
                'complaint.department.municipality.city.state',
                'complaint.user:id,name',
                'user:id,name,email',
                'municipality.city.state',
                'resolvedBy:id,name',
            ])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('id')
            ->paginate(20);

        return Inertia::render('admin/disputes', [
            'disputes' => $disputes,
        ]);
    }

    /**
     * Admin resolve a disputa: reabrir | aprovar | ignorar.
     */
    public function resolve(Request $request, ComplaintDispute $dispute)
    {
        $admin = auth('web')->user();
        if (! $admin || $admin->role !== 'admin') {
            abort(403);
        }

        if ($dispute->status !== 'pending') {
            return redirect()->back()->with('info', 'Esta contestação já foi resolvida.');
        }

        $action = $request->validate([
            'action' => ['required', 'in:reopened,approved,ignored'],
        ])['action'];

        $complaint = $dispute->complaint;
        $from = $complaint->status_id;

        switch ($action) {
            case 'reopened':
                $complaint->status_id = ComplaintStatus::OPEN;
                $complaint->save();
                ComplaintEventLogger::logStatusChange($complaint, $from, ComplaintStatus::OPEN, 'Reaberta pelo administrador após contestação');
                ComplaintNotifier::statusChanged($complaint, $from, ComplaintStatus::OPEN);
                break;
            case 'approved':
                $complaint->status_id = ComplaintStatus::SOLVED;
                $complaint->save();
                ComplaintEventLogger::logStatusChange($complaint, $from, ComplaintStatus::SOLVED, 'Marcada como resolvida pelo administrador após contestação');
                ComplaintNotifier::statusChanged($complaint, $from, ComplaintStatus::SOLVED);
                break;
            case 'ignored':
                // mantém REJECTED
                ComplaintEventLogger::log($complaint, 'dispute_resolved', 'Contestação ignorada pelo administrador');
                break;
        }

        $dispute->update([
            'status' => $action,
            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        if ($action !== 'ignored') {
            ComplaintEventLogger::log($complaint, 'dispute_resolved', match ($action) {
                'reopened' => 'Reaberta',
                'approved' => 'Aprovada',
                default => null,
            });
        }

        return redirect()->back()->with('success', 'Contestação resolvida.');
    }
}
