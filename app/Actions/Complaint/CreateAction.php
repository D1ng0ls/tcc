<?php

namespace App\Actions\Complaint;

use App\ComplaintStatus;
use App\Models\NeighborhoodSuggestion;
use App\Models\User;
use App\Support\ComplaintEventLogger;
use App\Support\NeighborhoodName;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateAction
{
    /**
     * @param array $data dados já validados pela CreateRequest (título, descrição, endereço,
     *                    departamento, cidade, bairro oficial ou nome livre)
     */
    public function execute(array $data, array $files, User $user)
    {
        return DB::transaction(function () use ($data, $files, $user) {

            // Mantém apenas as colunas presentes no $fillable do Complaint
            // (Complaint::$fillable: title, description, address, user_id, department_id,
            // municipality_id, neighborhood_id, status_id, district).
            $complaintData = array_intersect_key($data, array_flip([
                'title',
                'description',
                'address',
                'department_id',
                'neighborhood_id',
                'district',
            ]));
            $complaintData['status_id'] = ComplaintStatus::OPEN;
            // Bairro em texto livre já normalizado (UC018), igual ao nome da sugestão criada abaixo.
            if (! empty($complaintData['district'])) {
                $complaintData['district'] = NeighborhoodName::normalize($complaintData['district']);
            }

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
            // aprovação da prefeitura. city_id vem dos dados validados, fora de $fillable.
            if (
                empty($complaint->neighborhood_id) &&
                ! empty($complaintData['district']) &&
                ! empty($data['city_id'])
            ) {
                $name = NeighborhoodName::normalize($complaintData['district']);
                $cityId = (int) $data['city_id'];

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
