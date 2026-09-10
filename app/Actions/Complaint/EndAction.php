<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use App\ComplaintStatus;
use App\Support\ComplaintEventLogger;
use App\Support\ComplaintNotifier;

class EndAction
{
    public function execute(Complaint $complaint)
    {
        $isAdmin = auth('web')->user()?->role === 'admin';

        if ($complaint->status_id !== ComplaintStatus::IN_PROGRESS && ! $isAdmin) {
            abort(422, 'Reclamação não está em andamento.');
        }

        $from = $complaint->status_id;
        $complaint->status_id = ComplaintStatus::ENDED;
        $complaint->save();

        ComplaintEventLogger::logStatusChange($complaint, $from, ComplaintStatus::ENDED);
        ComplaintNotifier::statusChanged($complaint, $from, ComplaintStatus::ENDED);

        return $complaint;
    }
}
