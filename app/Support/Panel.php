<?php

namespace App\Support;

use App\Models\Complaint;
use App\Models\DepartmentUser;
use App\Models\Municipality;
use Illuminate\Support\Collection;

/**
 * Quem está usando o painel da prefeitura (cid.<domínio>):
 * - o master: o login da própria prefeitura (guard "municipality"), que vê e faz tudo;
 * - um usuário de departamento (guard "department"), que só atende o próprio departamento.
 */
class Panel
{
    public static function member(): ?DepartmentUser
    {
        // O login de um desconecta o outro; se mesmo assim os dois estiverem ativos, vale o master.
        return auth('municipality')->check() ? null : auth('department')->user();
    }

    public static function isMaster(): bool
    {
        return auth('municipality')->check();
    }

    /** A prefeitura do painel: o próprio master ou a prefeitura do usuário de departamento. */
    public static function municipality(): ?Municipality
    {
        return auth('municipality')->user() ?? self::member()?->municipality;
    }

    /** Quem responde pelas regras de acesso (ComplaintPolicy). */
    public static function actor(): Municipality|DepartmentUser|null
    {
        return auth('municipality')->user() ?? self::member();
    }

    /** Departamentos cujas reclamações quem está logado atende. */
    public static function departmentIds(): Collection
    {
        if ($member = self::member()) {
            return collect([$member->department_id]);
        }

        return self::municipality()?->departments()->pluck('id') ?? collect();
    }

    public static function handles(Complaint $complaint): bool
    {
        return self::departmentIds()->contains($complaint->department_id);
    }
}
