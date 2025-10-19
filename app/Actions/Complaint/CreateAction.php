<?php

namespace App\Actions\Complaint;

use App\ComplaintStatus;
use App\Http\Requests\Complaint\CreateRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class CreateAction
{
    public function execute(CreateRequest $request, array $files, User $user)
    {
        return DB::transaction(function () use ($request, $files, $user) {

            $complaintData = Arr::except($request, ['images']);
            $complaintData['status_id'] = ComplaintStatus::OPEN;

            $complaint = $user->complaints()->create($complaintData);

            foreach ($files as $file) {
                $path = $file->store('complaints', 'public');

                $fileType = Str::startsWith($file->getClientMimeType(), 'image')
                    ? 'image'
                    : 'video';

                $complaint->archives()->create([
                    'photo_url' => $path,
                    'type'      => $fileType,
                ]);
            }

            return $complaint;
        });
    }
}
