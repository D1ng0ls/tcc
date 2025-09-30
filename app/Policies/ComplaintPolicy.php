<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Complaint;
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

    public function view(User $user, Complaint $complaint)
    {
        return $user->id === $complaint->user_id;
    }

    public function approve(User $user, Complaint $complaint)
    {
        return $user->id === $complaint->user_id && $complaint->status_id === ComplaintStatus::ENDED;
    }

    public function reject(User $user, Complaint $complaint)
    {
        return $user->id === $complaint->user_id && $complaint->status_id === ComplaintStatus::ENDED;
    }

    public function delete(User $user, Complaint $complaint)
    {
        return $user->id === $complaint->user_id;
    }
}
