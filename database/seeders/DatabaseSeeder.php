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
        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('123456'),
            'cpf' => '12345678901',
            'birth_date' => '2000-01-01',
            'role' => 'admin',
        ]);

        $this->call([
            StateCitySeeder::class,
            NeighborhoodSeeder::class,
            StatusSeeder::class,
        ]);
    }
}
