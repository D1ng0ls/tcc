<?php

namespace App\Actions\Complaint;

use App\ComplaintStatus;
use App\Http\Requests\Complaint\CreateRequest;
use App\Models\NeighborhoodSuggestion;
use App\Models\User;
use App\Support\ComplaintEventLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateAction
{
    public function execute(CreateRequest $request, array $files, User $user)
    {
        return DB::transaction(function () use ($request, $files, $user) {

            // Mantém apenas as colunas presentes no $fillable do Complaint
            // (Complaint::$fillable: title, description, address, user_id, department_id,
            // municipality_id, neighborhood_id, status_id, district).
            $complaintData = $request->only([
                'title',
                'description',
                'address',
                'department_id',
                'neighborhood_id',
                'district',
            ]);
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

            // Se o cidadão usou bairro livre (district), registra como sugestão pra
            // aprovação da prefeitura. city_id vem do request, fora de $fillable.
            if (
                empty($complaint->neighborhood_id) &&
                ! empty($complaintData['district']) &&
                $request->filled('city_id')
            ) {
                $name = trim($complaintData['district']);
                $cityId = (int) $request->input('city_id');

                $suggestion = NeighborhoodSuggestion::firstOrNew([
                    'city_id' => $cityId,
                    'name' => $name,
                ]);

                if ($suggestion->exists) {
                    // Já existia — incrementa contador (independente do status)
                    $suggestion->increment('hits');
                } else {
                    $suggestion->status = 'pending';
                    $suggestion->hits = 1;
                    $suggestion->save();
                }

                // Se já foi aprovada antes, vincula a complaint diretamente ao neighborhood
                if ($suggestion->status === 'approved' && $suggestion->approved_neighborhood_id) {
                    $complaint->update([
                        'neighborhood_id' => $suggestion->approved_neighborhood_id,
                        'district' => null,
                    ]);
                }
            }

            ComplaintEventLogger::logCreated($complaint);

            return $complaint;
        });
    }
}
