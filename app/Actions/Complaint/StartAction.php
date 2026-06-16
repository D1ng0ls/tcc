<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use App\ComplaintStatus;
use App\Support\ComplaintEventLogger;
use App\Support\ComplaintNotifier;

class StartAction
{
    public function execute(Complaint $complaint)
    {
        $isAdmin = auth('web')->user()?->role === 'admin';

        if ($complaint->status_id !== ComplaintStatus::OPEN && ! $isAdmin) {
            abort(422, 'Reclamação não está aberta.');
        }

        $from = $complaint->status_id;
        $complaint->status_id = ComplaintStatus::IN_PROGRESS;
        $complaint->save();

        ComplaintEventLogger::logStatusChange($complaint, $from, ComplaintStatus::IN_PROGRESS);
        ComplaintNotifier::statusChanged($complaint, $from, ComplaintStatus::IN_PROGRESS);

        return $complaint;
    }
}
