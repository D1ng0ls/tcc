<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Municipality;
use App\Models\City;

class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = City::all();

        foreach ($cities as $city) {
            Municipality::create([
                'name' => $city->name,
                'email' => $city->name . '@mail.com',
                'password' => Hash::make(Str::random(32)),
                'cnpj' => null,
                'photo_url' => null,
                'city_id' => $city->id,
            ]);
        }
    }
}
