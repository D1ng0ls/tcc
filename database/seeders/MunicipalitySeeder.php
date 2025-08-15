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
        $cities = City::all();

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

        foreach ($cities as $city) {
            $m = Municipality::create([
                'name' => $city->name,
                'email' => $city->name . '@mail.com',
                'password' => Hash::make(Str::random(32)),
                'cnpj' => null,
                'photo_url' => null,
                'city_id' => $city->id,
            ]);

            foreach ($departments as $department) {
                Department::create([
                    'name' => $department,
                    'municipality_id' => $m->id,
                    'is_default' => true,
                ]);
            }
        }
    }
}
