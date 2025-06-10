<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cidade;
use App\Models\Estado;

class EstadosCidadesSeeder extends Seeder
{
    public function run()
    {
        $json = file_get_contents(database_path('data/distritos.json'));
        $dados = json_decode($json, true);

        $estados = [];

        foreach ($dados as $item) {
            $ufSigla = $item['UF-sigla'];
            $ufNome = $item['UF-nome'];
            $cidadeNome = $item['municipio-nome'];

            if (!isset($estados[$ufSigla])) {
                $estado = Estado::firstOrCreate([
                    'uf' => $ufSigla,
                    'nome' => $ufNome,
                ]);
                $estados[$ufSigla] = $estado->id;
            }

            Cidade::firstOrCreate([
                'nome' => $cidadeNome,
                'estado_id' => $estados[$ufSigla],
            ]);
        }
    }
}
