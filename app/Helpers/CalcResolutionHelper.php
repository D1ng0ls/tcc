<?php

namespace App\Helpers;

use App\Models\Complaint;
use App\ComplaintStatus;

class CalcResolutionHelper
{
    public static function calc($complaints)
    {
        $total = $complaints->count();
        if ($total <= 0) {
            return null;
        }
        $resolved = $complaints->where('status_id', ComplaintStatus::SOLVED)->count();
        return round(($resolved / $total ) * 100, 2);
    }
}
