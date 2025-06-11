<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Neighborhood;
use App\Models\City;

class NeighborhoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bairros = json_decode(file_get_contents(database_path('data/bairros.json')), true)['data'];

        foreach ($bairros as $item) {
            if (!str_contains($item['Nome'], ' - ')) continue;

            [$bairro, $cidade] = explode(' - ', $item['Nome']);
            $uf = $item['Uf'];

            $city = City::where('name', $cidade)
                ->whereHas('state', function ($q) use ($uf) {
                    $q->where('uf', $uf);
                })
                ->first();

            if (!$city) {
                echo "Cidade não encontrada: $cidade - $uf\n";
                continue;
            }

            Neighborhood::firstOrCreate([
                'name' => $bairro,
                'city_id' => $city->id,
            ]);
        }
    }
}
