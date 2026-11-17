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
    }

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
