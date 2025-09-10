<?php

namespace Database\Seeders;

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
        $file = database_path('data/bairros.csv');

        if (!file_exists($file)) {
            echo "Arquivo CSV não encontrado: $file\n";
            return;
        }

        if (($handle = fopen($file, 'r')) !== false) {
            $header = fgetcsv($handle, 0, ','); // lê o cabeçalho

            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                $item = array_combine($header, $row);

                // filtra apenas bairros
                if (($item['type'] ?? '') !== 'neighborhood') continue;

                $bairro = $item['location_name'];
                $cidade = $item['city'];
                $uf = $item['state'];

                if (!$bairro || !$cidade || !$uf) continue;

                $city = City::where('name', $cidade)
                    ->whereHas('state', fn($q) => $q->where('uf', $uf))
                    ->first();

                if (!$city) {
                    echo "Cidade não encontrada: $cidade - $uf\n";
                    continue;
                }

                $neighborhood = Neighborhood::firstOrCreate([
                    'name' => $bairro,
                    'city_id' => $city->id,
                ]);

                echo "Bairro {$neighborhood->name} criado para a cidade de {$city->name} - {$city->state->uf}!\n";
            }

            fclose($handle);
        }

        echo "Seed de bairros concluído!\n";
    }
}
