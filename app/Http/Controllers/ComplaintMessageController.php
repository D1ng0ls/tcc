<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintMessage;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ComplaintMessageController extends Controller
{
    /**
     * Salva uma mensagem na thread pública da complaint.
     * Autor pode ser:
     * - cidadão dono da complaint
     * - admin (qualquer complaint)
     * - municipality dona do departamento da complaint
     */
    public function store(Request $request, Complaint $complaint)
    {
        $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ], [
            'body.required' => 'Escreva uma mensagem antes de enviar.',
            'body.max' => 'A mensagem deve ter no máximo 2000 caracteres.',
        ]);

        // Lock após veredito final: SOLVED ou REJECTED já ignorado pelo admin
        $complaint->loadMissing('disputes');
        $isFinalizedSolved = $complaint->status_id === \App\ComplaintStatus::SOLVED;
        $hasIgnoredDispute = $complaint->disputes->contains(fn ($d) => $d->status === 'ignored');
        $isFinalizedRejected = $complaint->status_id === \App\ComplaintStatus::REJECTED && $hasIgnoredDispute;
        if ($isFinalizedSolved || $isFinalizedRejected) {
            abort(403, 'Esta reclamação foi finalizada. A conversa está somente para leitura.');
        }

        $user = auth('web')->user();
        $municipality = auth('municipality')->user();

        if ($user) {
            $isOwner = $user->id === $complaint->user_id;
            $isAdmin = $user->role === 'admin';

            if (! $isOwner && ! $isAdmin) {
                abort(403, 'Você não pode escrever nesta reclamação.');
            }

            $message = ComplaintMessage::create([
                'complaint_id' => $complaint->id,
                'author_type' => $isAdmin ? 'admin' : 'user',
                'author_id' => $user->id,
                'author_name' => $user->name,
                'is_admin' => $isAdmin,
                'body' => $request->input('body'),
            ]);
        } elseif ($municipality) {
            $complaint->loadMissing('department');
            if (! $complaint->department || $complaint->department->municipality_id !== $municipality->id) {
                abort(403, 'Esta reclamação não pertence à sua prefeitura.');
            }

            $message = ComplaintMessage::create([
                'complaint_id' => $complaint->id,
                'author_type' => 'municipality',
                'author_id' => $municipality->id,
                'author_name' => $municipality->name,
                'is_admin' => false,
                'body' => $request->input('body'),
            ]);

            // Notifica o cidadão dono da complaint
            if ($complaint->user_id) {
                UserNotification::create([
                    'user_id' => $complaint->user_id,
                    'type' => 'message_received',
                    'title' => "A prefeitura respondeu sua reclamação #{$complaint->id}",
                    'body' => Str::limit($request->input('body'), 140),
                    'link' => '/complaints/show/' . $complaint->id,
                ]);
            }
        } else {
            abort(401, 'Faça login para responder.');
        }

        return redirect()->back()->with('success', 'Mensagem enviada.');
    }

    /**
     * Apenas admin pode excluir uma mensagem (soft delete).
     */
    public function destroy(ComplaintMessage $message)
    {
        $user = auth('web')->user();
        if (! $user || $user->role !== 'admin') {
            abort(403);
        }

        $message->delete();

        return redirect()->back()->with('success', 'Mensagem removida.');
    }
}
