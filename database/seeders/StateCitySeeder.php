<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\State;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StateCitySeeder extends Seeder
{
    public function run()
    {
        $path = database_path('data/distritos.json');
        if (!file_exists($path)) {
            $this->command->error("Arquivo não encontrado: $path");
            return;
        }

        $estadosCidades = json_decode(file_get_contents($path), true);

        $estadosUnicos = [];
        foreach ($estadosCidades as $item) {
            $uf = $item['UF-sigla'];
            if (!isset($estadosUnicos[$uf])) {
                $estadosUnicos[$uf] = [
                    'uf' => $uf,
                    'name' => $item['UF-nome'],
                ];
            }
        }

        State::upsert(array_values($estadosUnicos), ['uf'], ['name']);

        $stateMap = State::pluck('id', 'uf')->toArray();

        $cidades = [];
        foreach ($estadosCidades as $item) {
            $uf = $item['UF-sigla'];
            $nomeCidade = $item['municipio-nome'];

            if (isset($stateMap[$uf])) {
                $cidades[] = [
                    'state_id' => $stateMap[$uf],
                    'name' => $nomeCidade,
                    'slug' => Str::slug($nomeCidade)
                ];
            }
        }
        foreach (array_chunk($cidades, 1000) as $chunk) {
            City::upsert($chunk, ['state_id', 'name'], ['slug']);
        }

        $this->command->info('Estados e Cidades importados com sucesso!');
    }
}
