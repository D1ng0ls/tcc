<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use App\ComplaintStatus;

class StartAction
{
    public function execute(Complaint $complaint)
    {
        if ($complaint->status_id !== ComplaintStatus::OPEN && auth()->user()->role !== 'admin') {
            abort(422, 'Reclamação não está aberta.');
        }
        
        $complaint->status_id = ComplaintStatus::IN_PROGRESS;
        $complaint->save();

        return $complaint;
    }
}
