<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\City;
use App\Models\Municipality;
use App\Models\Department;

class MunicipalitySeeder extends Seeder
{
    public function run(): void
    {
        $departmentsList = [
            'Meio Ambiente',
            'Saúde',
            'Infraestrutura',
            'Segurança Pública',
            'Educação',
            'Economia',
            'Justiça',
            'Cultura',
            'Esporte',
            'Outros',
        ];

        $now = now();

        $lockedPasswordHash = Hash::make(Str::random(40));

        City::chunk(500, function ($cities) use ($departmentsList, $now, $lockedPasswordHash) {

            $municipalitiesData = [];

            foreach ($cities as $city) {
                $email = Str::slug($city->name . '-' . $city->state->uf) . '@mail.com';

                $municipalitiesData[] = [
                    'name'       => $city->name,
                    'email'      => $email,
                    'password'   => $lockedPasswordHash,
                    'cnpj'       => null,
                    'photo_url'  => '',
                    'city_id'    => $city->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            Municipality::upsert(
                $municipalitiesData,
                ['city_id'],
                ['name', 'email', 'password', 'updated_at']
            );

            $municipalityIds = Municipality::whereIn('city_id', $cities->pluck('id'))
                ->pluck('id');

            $allDepartments = [];
            foreach ($municipalityIds as $mId) {
                foreach ($departmentsList as $depName) {
                    $allDepartments[] = [
                        'name'            => $depName,
                        'municipality_id' => $mId,
                        'is_default'      => true,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ];
                }
            }
            Department::upsert(
                $allDepartments,
                ['municipality_id', 'name'],
                ['is_default', 'updated_at']
            );
        });
    }
}
