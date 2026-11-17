<?php

namespace App\Support\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

/**
 * E-mail para a prefeitura quando o cidadão avalia o encerramento como "Não resolvida":
 * ela pode contestar a avaliação pelo painel (UC016).
 */
class ComplaintRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(public Complaint $complaint)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $complaint = $this->complaint;

        return (new MailMessage)
            ->subject("Reclamação #{$complaint->id} marcada como não resolvida")
            ->greeting('Olá!')
            ->line("O cidadão avaliou o encerramento da reclamação #{$complaint->id} e informou que o problema não foi resolvido.")
            ->line('"' . Str::limit($complaint->title, 140) . '"')
            ->line('No painel da prefeitura, você pode ver o histórico e, se a solução foi entregue, contestar a avaliação junto ao administrador.')
            ->action('Abrir a reclamação', route('municipality.complaints.show', $complaint));
    }
}
