<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\Municipality;
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

    public function approve(User $user, Complaint $complaint)
    {
        return $user->role === 'admin' || ($user->id === $complaint->user_id && $complaint->status_id === ComplaintStatus::ENDED);
    }

    public function reject(User $user, Complaint $complaint)
    {
        return $user->role === 'admin' || ($user->id === $complaint->user_id && $complaint->status_id === ComplaintStatus::ENDED);
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
            return $auth->id === $complaint->department->municipality_id && $complaint->status_id === ComplaintStatus::OPEN;
        }

        return false;
    }

    public function end($auth, Complaint $complaint)
    {
        if ($auth instanceof \App\Models\User) {
            return $auth->role === 'admin';
        }

        if ($auth instanceof \App\Models\Municipality) {
            return $auth->id === $complaint->department->municipality_id && $complaint->status_id === ComplaintStatus::IN_PROGRESS;
        }

        return false;
    }
}
