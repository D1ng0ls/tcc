<?php

namespace Database\Seeders;

use App\ComplaintStatus;
use App\Models\City;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\Municipality;
use App\Models\Neighborhood;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Cria 20 usuários (user1@user1.com … user20@user20.com, senha 123456),
     * ativa 10 municipalities em cidades reais e gera 40-60 complaints
     * distribuídas com status e cidades variadas.
     */
    public function run(): void
    {
        // 1) Cidades-âncora: 10 cidades reais bem distribuídas
        $citySlugs = [
            ['name' => 'São Paulo', 'uf' => 'SP'],
            ['name' => 'Rio de Janeiro', 'uf' => 'RJ'],
            ['name' => 'Belo Horizonte', 'uf' => 'MG'],
            ['name' => 'Curitiba', 'uf' => 'PR'],
            ['name' => 'Porto Alegre', 'uf' => 'RS'],
            ['name' => 'Salvador', 'uf' => 'BA'],
            ['name' => 'Fortaleza', 'uf' => 'CE'],
            ['name' => 'Recife', 'uf' => 'PE'],
            ['name' => 'Florianópolis', 'uf' => 'SC'],
            ['name' => 'Birigui', 'uf' => 'SP'],
        ];

        $cities = collect();
        foreach ($citySlugs as $entry) {
            $city = City::whereHas('state', fn($q) => $q->where('uf', $entry['uf']))
                ->where('name', $entry['name'])
                ->first();
            if ($city) {
                $cities->push($city);
            }
        }

        if ($cities->isEmpty()) {
            $this->command->warn('Nenhuma cidade-âncora encontrada — abortando.');
            return;
        }

        // 2) Ativar as municipalities dessas cidades
        Municipality::whereIn('city_id', $cities->pluck('id'))
            ->update(['active' => true]);

        // 3) Criar 20 usuários (user1@user1.com … user20@user20.com)
        $passwordHash = Hash::make('123456');
        $users = collect();
        for ($i = 1; $i <= 20; $i++) {
            $city = $cities->random();
            $user = User::updateOrCreate(
                ['email' => "user{$i}@user{$i}.com"],
                [
                    'name' => "User {$i}",
                    'password' => $passwordHash,
                    'cpf' => str_pad((string) $i, 11, '0', STR_PAD_LEFT),
                    'birth_date' => now()->subYears(20 + ($i % 30))->format('Y-m-d'),
                    'address' => "Rua Demo, n. {$i}",
                    'city_id' => $city->id,
                ]
            );
            $users->push($user);
        }

        // 4) Templates de complaint pra ficar variado
        $titles = [
            'Buraco grande na via',
            'Lâmpada queimada na praça',
            'Acúmulo de lixo na esquina',
            'Mato alto em terreno público',
            'Falta de sinalização de trânsito',
            'Pichação em prédio público',
            'Vazamento de água na rua',
            'Calçada quebrada',
            'Esgoto entupido',
            'Semáforo com defeito',
            'Galho caído após chuva',
            'Falta de coleta seletiva',
            'Carro abandonado na via',
            'Ponto de ônibus sem cobertura',
            'Animais abandonados na praça',
        ];

        $descriptions = [
            'Problema persiste há semanas e está afetando moradores.',
            'Vizinhos já reportaram várias vezes e nada foi feito.',
            'Situação está se agravando, pedimos providências urgentes.',
            'Risco para pedestres e motoristas no local.',
            'Local sem manutenção há meses.',
        ];

        $departmentNamesByType = [
            'Buraco grande na via' => 'Infraestrutura',
            'Lâmpada queimada na praça' => 'Infraestrutura',
            'Acúmulo de lixo na esquina' => 'Meio Ambiente',
            'Mato alto em terreno público' => 'Meio Ambiente',
            'Falta de sinalização de trânsito' => 'Segurança Pública',
            'Pichação em prédio público' => 'Cultura',
            'Vazamento de água na rua' => 'Infraestrutura',
            'Calçada quebrada' => 'Infraestrutura',
            'Esgoto entupido' => 'Infraestrutura',
            'Semáforo com defeito' => 'Segurança Pública',
            'Galho caído após chuva' => 'Meio Ambiente',
            'Falta de coleta seletiva' => 'Meio Ambiente',
            'Carro abandonado na via' => 'Segurança Pública',
            'Ponto de ônibus sem cobertura' => 'Infraestrutura',
            'Animais abandonados na praça' => 'Saúde',
        ];

        $statusPool = [
            ComplaintStatus::OPEN,
            ComplaintStatus::OPEN,
            ComplaintStatus::OPEN,
            ComplaintStatus::IN_PROGRESS,
            ComplaintStatus::IN_PROGRESS,
            ComplaintStatus::ENDED,
            ComplaintStatus::SOLVED,
            ComplaintStatus::SOLVED,
            ComplaintStatus::REJECTED,
        ];

        // 5) Gerar 50 complaints distribuídas
        $totalComplaints = 50;
        $created = 0;

        foreach ($users as $idx => $user) {
            // 2-3 complaints por user, ajustando pra fechar perto de 50
            $count = $idx < ($totalComplaints - 20) ? 3 : 2;
            for ($i = 0; $i < $count; $i++) {
                $city = $cities->random();
                $municipality = Municipality::where('city_id', $city->id)->first();
                if (! $municipality) continue;

                $title = $titles[array_rand($titles)];
                $departmentName = $departmentNamesByType[$title] ?? 'Outros';
                $department = Department::where('municipality_id', $municipality->id)
                    ->where('name', $departmentName)
                    ->first();
                if (! $department) {
                    $department = Department::where('municipality_id', $municipality->id)->inRandomOrder()->first();
                }
                if (! $department) continue;

                $neighborhood = Neighborhood::where('city_id', $city->id)->inRandomOrder()->first();

                Complaint::create([
                    'title' => $title,
                    'description' => $descriptions[array_rand($descriptions)],
                    'address' => 'Rua Exemplo, ' . random_int(10, 999),
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'neighborhood_id' => $neighborhood?->id,
                    'district' => $neighborhood ? null : 'Centro',
                    'status_id' => $statusPool[array_rand($statusPool)],
                ]);

                $created++;
                if ($created >= $totalComplaints) break 2;
            }
        }

        $this->command->info("Demo: {$users->count()} users, {$created} complaints, " . $cities->count() . ' cidades ativadas.');
    }
}
