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
        if ($auth instanceof \App\Models\User) {
            return $auth->id === $complaint->user_id || $auth->role === 'admin';
        }

        if ($auth instanceof \App\Models\Municipality) {
            return $auth->id === $complaint->department->municipality_id;
        }

        return false;
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
