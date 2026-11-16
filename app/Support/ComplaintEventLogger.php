<?php

namespace App\Support;

use App\Models\Complaint;
use App\Models\ComplaintEvent;

class ComplaintEventLogger
{
    /**
     * Resolve o ator (tipo, id, nome) a partir das guards autenticadas no momento.
     * Prioridade: web (admin/cidadão) > municipality > system.
     */
    public static function currentActor(): array
    {
        $web = auth('web')->user();
        if ($web) {
            return [
                'type' => $web->role === 'admin' ? 'admin' : 'user',
                'id' => $web->id,
                'name' => $web->name,
            ];
        }

        $muni = auth('municipality')->user();
        if ($muni) {
            return [
                'type' => 'municipality',
                'id' => $muni->id,
                'name' => $muni->name,
            ];
        }

        return ['type' => 'system', 'id' => null, 'name' => 'Sistema'];
    }

    public static function logCreated(Complaint $complaint): ComplaintEvent
    {
        $actor = self::currentActor();
        return ComplaintEvent::create([
            'complaint_id' => $complaint->id,
            'type' => 'created',
            'from_status' => null,
            'to_status' => $complaint->status_id,
            'actor_type' => $actor['type'],
            'actor_id' => $actor['id'],
            'actor_name' => $actor['name'],
            'note' => null,
        ]);
    }

    public static function logStatusChange(Complaint $complaint, int $from, int $to, ?string $note = null): ComplaintEvent
    {
        $actor = self::currentActor();
        return ComplaintEvent::create([
            'complaint_id' => $complaint->id,
            'type' => 'status_change',
            'from_status' => $from,
            'to_status' => $to,
            'actor_type' => $actor['type'],
            'actor_id' => $actor['id'],
            'actor_name' => $actor['name'],
            'note' => $note,
        ]);
    }

    public static function log(Complaint $complaint, string $type, ?string $note = null, ?int $fromStatus = null, ?int $toStatus = null): ComplaintEvent
    {
        $actor = self::currentActor();
        return ComplaintEvent::create([
            'complaint_id' => $complaint->id,
            'type' => $type,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_type' => $actor['type'],
            'actor_id' => $actor['id'],
            'actor_name' => $actor['name'],
            'note' => $note,
        ]);
    }
}
