<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use App\ComplaintStatus;

class EndAction
{
    public function execute(Complaint $complaint)
    {
        if ($complaint->status_id !== ComplaintStatus::IN_PROGRESS && auth()->user()->role !== 'admin') {
            abort(422, 'Reclamação não está em andamento.');
        }

        $complaint->status_id = ComplaintStatus::ENDED;
        $complaint->save();

        return $complaint;
    }
}
