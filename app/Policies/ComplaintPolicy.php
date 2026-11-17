<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\Municipality;
use App\Models\Status;
use App\Models\User;
use App\ComplaintStatus;

class ComplaintPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }

    public function update(User $user)
    {
        return $user->role === 'admin';
    }

    public function view($auth, Complaint $complaint)
    {
        // Reclamação é pública — qualquer pessoa (autenticada ou não) pode
        // visualizar a página de detalhes. Dados sensíveis do autor (CPF, etc.)
        // devem ser sanitizados na renderização (UC011/RNF006).
        return true;
    }

    /*
     * A política verifica quem pode agir e em que situação; a ação revalida a situação ao executar
     * (o que permite a exceção do administrador). Quem pode aplicar cada situação vem do "tipo" do
     * status (Status::podeSerAplicadoPor): 'user' para a avaliação do cidadão, 'municipality' para o
     * atendimento.
     */
    public function approve(User $user, Complaint $complaint)
    {
        return $user->role === 'admin' || ($user->id === $complaint->user_id
            && $complaint->status_id === ComplaintStatus::ENDED
            && Status::aplicavelPor(ComplaintStatus::SOLVED, 'user'));
    }

    public function reject(User $user, Complaint $complaint)
    {
        return $user->role === 'admin' || ($user->id === $complaint->user_id
            && $complaint->status_id === ComplaintStatus::ENDED
            && Status::aplicavelPor(ComplaintStatus::REJECTED, 'user'));
    }

    public function delete(User $user, Complaint $complaint)
    {
        return $user->id === $complaint->user_id || $user->role === 'admin';
    }

    public function start($auth, Complaint $complaint)
    {
        if ($auth instanceof \App\Models\User) {
            return $auth->role === 'admin';
        }

        if ($auth instanceof \App\Models\Municipality) {
            return $auth->id === $complaint->department->municipality_id
                && $complaint->status_id === ComplaintStatus::OPEN
                && Status::aplicavelPor(ComplaintStatus::IN_PROGRESS, 'municipality');
        }

        return false;
    }

    public function end($auth, Complaint $complaint)
    {
        if ($auth instanceof \App\Models\User) {
            return $auth->role === 'admin';
        }

        if ($auth instanceof \App\Models\Municipality) {
            return $auth->id === $complaint->department->municipality_id
                && $complaint->status_id === ComplaintStatus::IN_PROGRESS
                && Status::aplicavelPor(ComplaintStatus::ENDED, 'municipality');
        }

        return false;
    }

    /**
     * Encaminhar para outro departamento: a prefeitura da reclamação, enquanto ela ainda
     * está sendo atendida (aberta ou em andamento).
     */
    public function changeDepartment($auth, Complaint $complaint)
    {
        $inService = in_array($complaint->status_id, [ComplaintStatus::OPEN, ComplaintStatus::IN_PROGRESS], true);

        if ($auth instanceof \App\Models\Municipality) {
            return $inService && $auth->id === $complaint->department->municipality_id;
        }

        return false;
    }
}
