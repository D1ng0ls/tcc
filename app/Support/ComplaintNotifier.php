<?php

namespace App\Support;

use App\ComplaintStatus;
use App\Models\Complaint;
use App\Models\UserNotification;
use App\Support\Notifications\ComplaintRejectedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Throwable;

/**
 * Avisos sobre a reclamação. O cidadão recebe Notificações (que, não lidas, marcam a
 * reclamação com novidade na lista dele); a prefeitura não tem notificações próprias:
 * a novidade aparece pelo marcador da lista (Complaint::registerActivity) e, quando o
 * cidadão marca "Não resolvida", também por e-mail.
 */
class ComplaintNotifier
{
    /**
     * Mudança de situação. O cidadão é avisado quando outra pessoa (prefeitura, admin) muda
     * a situação; quando a reclamação vira "Não resolvida", a prefeitura recebe um e-mail
     * para poder contestar (UC016).
     */
    public static function statusChanged(Complaint $complaint, int $from, int $to): void
    {
        if ($to === ComplaintStatus::REJECTED) {
            self::mailMunicipalityRejected($complaint);
        }

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

        self::notifyAuthor($complaint, 'status_changed', $title);
    }

    /**
     * Notifica o cidadão dono da complaint quando a prefeitura abre uma
     * contestação (disputa administrativa) sobre a avaliação "Não resolvida".
     */
    public static function disputeOpened(Complaint $complaint): void
    {
        self::notifyAuthor($complaint, 'dispute_opened', "A prefeitura contestou a avaliação da sua reclamação #{$complaint->id}");
    }

    /**
     * O administrador ignorou a contestação: a avaliação "Não resolvida" do cidadão fica mantida.
     */
    public static function disputeIgnored(Complaint $complaint): void
    {
        self::notifyAuthor($complaint, 'dispute_resolved', "O administrador manteve a sua avaliação da reclamação #{$complaint->id} como não resolvida");
    }

    /**
     * Avisa o cidadão que a prefeitura encaminhou a reclamação para outro departamento.
     */
    public static function departmentChanged(Complaint $complaint, string $to): void
    {
        self::notifyAuthor($complaint, 'department_changed', "Sua reclamação #{$complaint->id} foi encaminhada para o departamento {$to}");
    }

    /**
     * Mensagem da prefeitura ou do administrador na reclamação: avisa o cidadão autor.
     */
    public static function messageReceived(Complaint $complaint, string $authorType, string $body): void
    {
        $title = $authorType === 'admin'
            ? "O administrador escreveu na sua reclamação #{$complaint->id}"
            : "A prefeitura respondeu sua reclamação #{$complaint->id}";

        self::notifyAuthor($complaint, 'message_received', $title, Str::limit($body, 140));
    }

    private static function notifyAuthor(Complaint $complaint, string $type, string $title, ?string $body = null): void
    {
        if (! $complaint->user_id) {
            return;
        }

        UserNotification::create([
            'user_id' => $complaint->user_id,
            'complaint_id' => $complaint->id,
            'type' => $type,
            'title' => $title,
            'body' => $body ?? ($complaint->title ? Str::limit($complaint->title, 140) : null),
            'link' => '/complaints/show/' . $complaint->id,
        ]);
    }

    /**
     * E-mail para a prefeitura da reclamação (só se ela estiver ativa). Falha no envio não
     * desfaz a avaliação do cidadão.
     */
    private static function mailMunicipalityRejected(Complaint $complaint): void
    {
        $municipality = $complaint->loadMissing('department.municipality')->department?->municipality;

        if (! $municipality || ! $municipality->active || ! $municipality->email) {
            return;
        }

        try {
            Notification::route('mail', $municipality->email)->notify(new ComplaintRejectedNotification($complaint));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
