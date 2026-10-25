<?php

namespace App\Support;

use App\Models\Complaint;
use App\Models\ComplaintEvent;

class ComplaintEventLogger
{
    /**
     * Resolve o ator (tipo, id, nome) a partir das guards autenticadas no momento.
     * Prioridade: web (admin/cidadão) > municipality (master) > department (usuário de departamento,
     * registrado como a prefeitura dele + quem foi e de qual departamento).
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

        $member = auth('department')->user();
        if ($member) {
            $member->loadMissing('municipality', 'department');

            return [
                'type' => 'municipality',
                'id' => $member->municipality_id,
                'name' => $member->municipality->name,
                'member' => self::memberColumns(),
            ];
        }

        return ['type' => 'system', 'id' => null, 'name' => 'Sistema'];
    }

    /**
     * Colunas member_* de quem age pelo painel como usuário de departamento (vazias para os demais).
     * Usadas no histórico e nas mensagens.
     */
    public static function memberColumns(): array
    {
        $member = auth('web')->check() || auth('municipality')->check() ? null : auth('department')->user();
        if (! $member) {
            return [];
        }

        $member->loadMissing('department');

        return [
            'member_id' => $member->id,
            'member_name' => $member->name,
            'member_department_id' => $member->department_id,
            'member_department_name' => $member->department?->name,
        ];
    }

    public static function logCreated(Complaint $complaint): ComplaintEvent
    {
        return self::log($complaint, 'created', null, null, $complaint->status_id);
    }

    public static function logStatusChange(Complaint $complaint, int $from, int $to, ?string $note = null): ComplaintEvent
    {
        return self::log($complaint, 'status_change', $note, $from, $to);
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
            ...($actor['member'] ?? []),
        ]);
    }
}
