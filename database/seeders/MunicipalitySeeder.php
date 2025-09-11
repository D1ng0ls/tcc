<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\City;
use App\Models\Municipality;
use App\Models\Department;

class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
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

        City::chunk(100, function ($cities) use ($departments, $now) {
            $municipalities = [];
            $allDepartments = [];

            foreach ($cities as $city) {
                $municipalities[] = [
                    'name' => $city->name,
                    'email' => $city->name . '@mail.com',
                    'password' => Str::random(60),
                    'cnpj' => null,
                    'photo_url' => '',
                    'city_id' => $city->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            Municipality::upsert(
                $municipalities,
                ['city_id'],
                ['name', 'email', 'password', 'updated_at']
            );

            $municipalities = Municipality::whereIn('city_id', $cities->pluck('id'))
                ->get(['id', 'city_id']);

            foreach ($municipalities as $m) {
                foreach ($departments as $dep) {
                    $allDepartments[] = [
                        'name' => $dep,
                        'municipality_id' => $m->id,
                        'is_default' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
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
