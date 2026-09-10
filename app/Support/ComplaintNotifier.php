<?php

namespace App\Support;

use App\ComplaintStatus;
use App\Models\Complaint;
use App\Models\UserNotification;
use Illuminate\Support\Str;

class ComplaintNotifier
{
    /**
     * Notifica o cidadão dono da complaint quando alguém (prefeitura, admin)
     * muda o status. Se quem mudou foi o próprio cidadão, não notifica.
     */
    public static function statusChanged(Complaint $complaint, int $from, int $to): void
    {
        if (! $complaint->user_id) {
            return;
        }

        // Se o ator é o próprio cidadão, não dispara
        $actor = ComplaintEventLogger::currentActor();
        if ($actor['type'] === 'user' && $actor['id'] === $complaint->user_id) {
            return;
        }

        $title = match ($to) {
            ComplaintStatus::OPEN => "Sua reclamação #{$complaint->id} foi reaberta",
            ComplaintStatus::IN_PROGRESS => "A prefeitura iniciou o atendimento da sua reclamação #{$complaint->id}",
            ComplaintStatus::ENDED => "A prefeitura encerrou os trabalhos na sua reclamação #{$complaint->id} — avalie a resolução",
            ComplaintStatus::SOLVED => "Sua reclamação #{$complaint->id} foi marcada como resolvida",
            ComplaintStatus::REJECTED => "Sua reclamação #{$complaint->id} foi marcada como não resolvida",
            default => "Status da sua reclamação #{$complaint->id} foi atualizado",
        };

        UserNotification::create([
            'user_id' => $complaint->user_id,
            'type' => 'status_changed',
            'title' => $title,
            'body' => $complaint->title ? Str::limit($complaint->title, 140) : null,
            'link' => '/complaints/show/' . $complaint->id,
        ]);
    }

    /**
     * Notifica o cidadão dono da complaint quando a prefeitura abre uma
     * contestação (disputa administrativa) sobre a avaliação "Não resolvida".
     */
    public static function disputeOpened(Complaint $complaint): void
    {
        if (! $complaint->user_id) {
            return;
        }

        UserNotification::create([
            'user_id' => $complaint->user_id,
            'type' => 'dispute_opened',
            'title' => "A prefeitura contestou a avaliação da sua reclamação #{$complaint->id}",
            'body' => $complaint->title ? Str::limit($complaint->title, 140) : null,
            'link' => '/complaints/show/' . $complaint->id,
        ]);
    }
}
