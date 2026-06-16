<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function markAsRead(Request $request, UserNotification $notification)
    {
        $user = $request->user();
        if (! $user || $user->id !== $notification->user_id) {
            abort(403);
        }

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->userNotifications()->whereNull('read_at')->update(['read_at' => now()]);
        return redirect()->back();
    }
}
