<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\State;

class StateCitySeeder extends Seeder
{
    public function run()
    {
        $estadosCidades = json_decode(file_get_contents(database_path('data/distritos.json')), true);

        $estados = [];

        foreach ($estadosCidades as $item) {
            $ufSigla = $item['UF-sigla'];
            $ufNome = $item['UF-nome'];
            $cidadeNome = $item['municipio-nome'];

            if (!isset($estados[$ufSigla])) {
                $estado = State::firstOrCreate([
                    'uf' => $ufSigla,
                    'name' => $ufNome,
                ]);
                $estados[$ufSigla] = $estado->id;
            }

            City::firstOrCreate([
                'name' => $cidadeNome,
                'state_id' => $estados[$ufSigla],
            ]);
        }
    }
}
