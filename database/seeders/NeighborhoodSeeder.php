<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Neighborhood;
use Illuminate\Support\Facades\DB;

class NeighborhoodSeeder extends Seeder
{
    public function run(): void
    {
        $file = database_path('data/bairros.csv');

        if (!file_exists($file)) {
            $this->command->error("Arquivo CSV não encontrado: $file");
            return;
        }

        $this->command->info('Carregando mapa de cidades...');

        $cityMap = DB::table('cities')
            ->join('states', 'states.id', '=', 'cities.state_id')
            ->select('cities.id', 'cities.name', 'states.uf')
            ->get()
            ->mapWithKeys(function ($item) {
                $key = strtoupper(trim($item->uf)) . '-' . strtoupper(trim($item->name));
                return [$key => $item->id];
            })
            ->toArray();

        $handle = fopen($file, 'r');
        $header = fgetcsv($handle, 0, ',');

        $batch = [];
        $batchSize = 1000;
        $count = 0;

        $this->command->info('Importando bairros...');
        $progressBar = $this->command->getOutput()->createProgressBar();

        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if (count($header) !== count($row)) continue;

            $item = array_combine($header, $row);
            if (($item['type'] ?? '') !== 'neighborhood') continue;

            $bairroNome = $item['location_name'] ?? null;
            $cidadeNome = $item['city'] ?? null;
            $uf         = $item['state'] ?? null;

            if (!$bairroNome || !$cidadeNome || !$uf) continue;

            $searchKey = strtoupper(trim($uf)) . '-' . strtoupper(trim($cidadeNome));

            if (isset($cityMap[$searchKey])) {
                $batch[] = [
                    'city_id' => $cityMap[$searchKey],
                    'name'    => $bairroNome,
                ];

                $count++;
                $progressBar->advance();
            }

            if (count($batch) >= $batchSize) {
                $this->upsertBatch($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            $this->upsertBatch($batch);
        }

        fclose($handle);
        $progressBar->finish();
        $this->command->newLine();
        $this->command->info("Seed concluído! Total processado: $count bairros.");
    }

    private function upsertBatch(array $data)
    {
        Neighborhood::upsert(
            $data,
            ['city_id', 'name'],
            ['name']
        );
    }
}
