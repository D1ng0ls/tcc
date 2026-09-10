<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $myComplaints = $request->user()->complaints;

        return Inertia::render('dashboard', compact('myComplaints'));
    }
}
