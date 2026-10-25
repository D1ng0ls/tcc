<?php

namespace App\Support;

use App\Models\Complaint;
use App\Models\Department;
use App\Models\PanelNotification;
use Illuminate\Support\Str;

/**
 * Avisos no dashboard do painel da prefeitura. Vão para as pessoas do departamento da
 * reclamação; departamento sem ninguém cadastrado avisa o master.
 */
class PanelNotifier
{
    public static function newComplaint(Complaint $complaint): void
    {
        self::notifyDepartment($complaint, 'complaint_created', "Nova reclamação #{$complaint->id}");
    }

    public static function forwarded(Complaint $complaint, string $fromDepartment): void
    {
        self::notifyDepartment($complaint, 'complaint_forwarded', "Reclamação #{$complaint->id} encaminhada de {$fromDepartment}");
    }

    private static function notifyDepartment(Complaint $complaint, string $type, string $title): void
    {
        $department = Department::with('users:id,department_id')->find($complaint->department_id);
        if (! $department?->municipality_id) {
            return;
        }

        $base = [
            'municipality_id' => $department->municipality_id,
            'type' => $type,
            'title' => "{$title} — {$department->name}",
            'body' => $complaint->title ? Str::limit($complaint->title, 140) : null,
            'link' => '/complaints/' . $complaint->id,
        ];

        // Quem fez o encaminhamento não precisa ser avisado de novo.
        $actingMemberId = ComplaintEventLogger::memberColumns()['member_id'] ?? null;
        $recipients = $department->users->pluck('id')->reject(fn ($id) => $id === $actingMemberId);

        if ($department->users->isEmpty()) {
            PanelNotification::create([...$base, 'department_user_id' => null]);
            return;
        }

        foreach ($recipients as $memberId) {
            PanelNotification::create([...$base, 'department_user_id' => $memberId]);
        }
    }
}
