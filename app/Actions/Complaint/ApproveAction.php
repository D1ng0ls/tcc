<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use Illuminate\Support\Facades\DB;
use App\ComplaintStatus;

class ApproveAction
{
    public function execute(Complaint $complaint)
    {
        if ($complaint->status_id !== ComplaintStatus::ENDED && auth()->user()->role !== 'admin') {
            abort(422, 'Reclamação não está finalizada.');
        }
        
        $complaint->status_id = ComplaintStatus::SOLVED;
        $complaint->save();

        return $complaint;
    }
}
