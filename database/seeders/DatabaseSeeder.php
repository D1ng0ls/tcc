<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => config('app.admin.email')],
            [
                'name' => 'admin',
                'password' => Hash::make(config('app.admin.password')),
                'cpf' => '00000000000',
                'birth_date' => '2000-01-01',
                'role' => 'admin',
            ]
        );

        $this->call([
            StateCitySeeder::class,
            NeighborhoodSeeder::class,
            StatusSeeder::class,
            MunicipalitySeeder::class,
        ]);
    }
}
