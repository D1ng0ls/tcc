<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintEvent extends Model
{
    protected $fillable = [
        'complaint_id',
        'type',
        'from_status',
        'to_status',
        'actor_type',
        'actor_id',
        'actor_name',
        'note',
    ];

    protected static function booted(): void
    {
        // Todo evento do histórico é uma novidade na reclamação (RF060).
        static::created(function (ComplaintEvent $event) {
            $event->complaint?->registerActivity($event->actor_type);
        });

        // Histórico imutável (RNF011): um evento registrado não é alterado nem apagado pelo sistema.
        // A única exceção é a anonimização do nome do autor quando a conta é excluída (LGPD), feita
        // por atualização direta em User::anonymizeAndDelete().
        static::updating(function () {
            throw new \LogicException('Eventos do histórico da reclamação não podem ser alterados.');
        });
        static::deleting(function () {
            throw new \LogicException('Eventos do histórico da reclamação não podem ser apagados.');
        });
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
