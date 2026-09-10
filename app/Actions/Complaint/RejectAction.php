<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use App\ComplaintStatus;
use App\Support\ComplaintEventLogger;
use App\Support\ComplaintNotifier;

class RejectAction
{
    public function execute(Complaint $complaint)
    {
        $isAdmin = auth('web')->user()?->role === 'admin';

        if ($complaint->status_id !== ComplaintStatus::ENDED && ! $isAdmin) {
            abort(422, 'Reclamação não está finalizada.');
        }

        $from = $complaint->status_id;
        $complaint->status_id = ComplaintStatus::REJECTED;
        $complaint->save();

        ComplaintEventLogger::logStatusChange($complaint, $from, ComplaintStatus::REJECTED);
        ComplaintNotifier::statusChanged($complaint, $from, ComplaintStatus::REJECTED);

        return $complaint;
    }
}
