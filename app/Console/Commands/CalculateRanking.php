<?php

namespace App\Console\Commands;

use App\ComplaintStatus;
use App\Helpers\CalcResolutionHelper;
use App\Models\City;
use App\Models\Ranking;
use App\Models\Complaint;
use App\Models\State;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB; // Precisa do DB

class CalculateRanking extends Command
{
    /**
     * A assinatura do comando.
     */
    protected $signature = 'app:calculate-ranking {--city= : ID da cidade} {--state= : ID do estado}';

    /**
     * A descrição do comando.
     */
    protected $description = 'Calcula e armazena o ranking de resoluções das cidades';

    /**
     * Executa o comando.
     */
    public function handle()
    {
        $cityId = $this->option('city');
        $stateId = $this->option('state');

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $citiesQuery = City::query()
            ->with('municipality.departments:id,municipality_id');

        if ($cityId) {
            $this->info("Calculando notas APENAS para a cidade ID: $cityId (Mês: $currentMonth/$currentYear)...");
            $citiesQuery->where('id', $cityId);
        } elseif ($stateId) {
            $this->info("Calculando notas APENAS para o estado ID: $stateId (Mês: $currentMonth/$currentYear)...");
            $citiesQuery->where('state_id', $stateId);
        } else {
            $this->info("Calculando notas para TODAS as cidades (Brasil) (Mês: $currentMonth/$currentYear)...");
        }

        $totalCities = $citiesQuery->count();
        if ($totalCities === 0) {
            $this->error('Nenhuma cidade encontrada com esses filtros.');
            return 1;
        }

        // =================================================================
        // FASE 1: CALCULAR E SALVAR AS NOTAS
        // =================================================================
        $bar = $this->output->createProgressBar($totalCities);
        $bar->start();

        $citiesQuery->chunkById(100, function (Collection $cities) use ($bar, $currentMonth, $currentYear) {

            $departmentIds = $cities
                ->pluck('municipality.departments')
                ->flatten()
                ->pluck('id')
                ->unique();

            $complaints = Complaint::whereIn('department_id', $departmentIds)
                ->select('id', 'department_id', 'status_id')
                ->get();

            $complaintsByDept = $complaints->groupBy('department_id');
            $rankingData = [];

            foreach ($cities as $city) {
                $cityComplaints = new Collection();
                if ($city->municipality) {
                    foreach ($city->municipality->departments as $department) {
                        if (isset($complaintsByDept[$department->id])) {
                            $cityComplaints = $cityComplaints->concat($complaintsByDept[$department->id]);
                        }
                    }
                }

                $total = $cityComplaints->count();
                $solved = $cityComplaints->where('status_id', ComplaintStatus::SOLVED)->count();
                $resolution = CalcResolutionHelper::calc($cityComplaints);

                $rankingData[] = [
                    'city_id' => $city->id,
                    'state_id' => $city->state_id,
                    'total_complaints' => $total,
                    'solved_complaints' => $solved,
                    'resolution' => $resolution,
                    'rank' => null,
                    'month' => $currentMonth,
                    'year' => $currentYear,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Ranking::upsert(
                $rankingData,
                ['city_id', 'month', 'year'],
                ['state_id', 'total_complaints', 'solved_complaints', 'resolution', 'rank', 'updated_at']
            );

            $bar->advance($cities->count());
        });

        $bar->finish();
        $this->info("\nFase 1 (Cálculo de Notas) concluída.");

        // =================================================================
        // FASE 2: CALCULAR E SALVAR AS POSIÇÕES
        // =================================================================
        $this->info("Iniciando Fase 2 (Cálculo de Posição Nacional)...");

        $queryRank = Ranking::where('month', $currentMonth)
            ->where('year', $currentYear);

        if ($cityId) {
            $queryRank->where('city_id', $cityId);
        } elseif ($stateId) {
            $queryRank->where('state_id', $stateId);
        }

        $orderedRankings = Ranking::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->when($cityId, fn($q) => $q->where('city_id', $cityId))
            ->when($stateId, fn($q) => $q->where('state_id', $stateId))
            ->join('cities', 'rankings.city_id', '=', 'cities.id')
            ->join('states', 'cities.state_id', '=', 'states.id')
            ->select('rankings.*')
            ->orderBy('rankings.resolution', 'desc')
            ->orderBy('rankings.solved_complaints', 'desc')
            ->orderBy('cities.name', 'asc')
            ->orderBy('states.uf', 'asc')
            ->get();

        if ($orderedRankings->isEmpty()) {
            $this->info("\nNenhum ranking encontrado para calcular posições.");
            $this->info("Cálculo de ranking finalizado.");
            return 0;
        }

        $cases = [];
        $bindings = [];
        $ids = [];
        $position = 1;

        foreach ($orderedRankings as $ranking) {
            $cases[] = "WHEN ? THEN ?";

            $bindings[] = $ranking->id;
            $bindings[] = $position++;

            $ids[] = $ranking->id;
        }

        $idsSql = implode(',', array_fill(0, count($ids), '?'));
        $casesSql = implode(' ', $cases);
        $bindings = array_merge($bindings, $ids);

        DB::update(
            "UPDATE rankings SET `rank` = (CASE `id` {$casesSql} END) WHERE `id` IN ({$idsSql})",
            $bindings
        );

        $this->info("\nFase 2 (Cálculo de Posições Nacionais) concluída! " . $orderedRankings->count() . " cidades rankeadas.");
        // =================================================================
        // FASE 3: CÁLCULO DO RANK ESTADUAL
        // =================================================================
        $this->info("Iniciando Fase 3 (Cálculo de Posição Estadual)...");

        $stateIdsToRank = [];
        if ($cityId) {
            $city = City::find($cityId);
            $stateIdsToRank = [$city->state_id];
        } elseif ($stateId) {
            $stateIdsToRank = [$stateId];
        } else {
            $this->info("Calculando ranking para todos os 27 estados...");
            $stateIdsToRank = State::pluck('id')->toArray();
        }

        $stateBar = $this->output->createProgressBar(count($stateIdsToRank));
        $stateBar->start();

        foreach ($stateIdsToRank as $sId) {

            $orderedStateRankings = Ranking::where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('rankings.state_id', $sId)
                ->join('cities', 'rankings.city_id', '=', 'cities.id')
                ->join('states', 'cities.state_id', '=', 'states.id')
                ->select('rankings.*')
                ->orderBy('rankings.resolution', 'desc')
                ->orderBy('rankings.solved_complaints', 'desc')
                ->orderBy('cities.name', 'asc')
                ->orderBy('states.uf', 'asc')
                ->get();

            if ($orderedStateRankings->isEmpty()) {
                $stateBar->advance();
                continue;
            }

            $cases = [];
            $bindings = [];
            $ids = [];
            $position = 1;

            foreach ($orderedStateRankings as $ranking) {
                $cases[] = "WHEN ? THEN ?";
                $bindings[] = $ranking->id;
                $bindings[] = $position++;
                $ids[] = $ranking->id;
            }

            $idsSql = implode(',', array_fill(0, count($ids), '?'));
            $casesSql = implode(' ', $cases);
            $bindings = array_merge($bindings, $ids);

            DB::update(
                "UPDATE rankings SET `rank_state` = (CASE `id` {$casesSql} END) WHERE `id` IN ({$idsSql})",
                $bindings
            );

            $stateBar->advance();
        }

        $stateBar->finish();
        $this->info("\nFase 3 (Cálculo de Posições Estaduais) concluída!");
        $this->info("Cálculo de ranking finalizado com sucesso!");
        return 0;
    }
}
