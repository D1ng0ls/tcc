<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Status;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $status = [
            ['name' => 'Aberto', 'type' => 'municipality'],
            ['name' => 'Em andamento', 'type' => 'municipality'],
            ['name' => 'Fechado', 'type' => 'municipality'],
            ['name' => 'Resolvido', 'type' => 'user'],
            ['name' => 'Não resolvido', 'type' => 'user'],
            ['name' => 'Encerrado', 'type' => 'system']
        ];

        Status::insert($status);
    }
}
