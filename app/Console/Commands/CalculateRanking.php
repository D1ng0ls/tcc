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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CalculateRanking extends Command
{
    /**
     * A assinatura do comando.
     */
    protected $signature = 'app:calculate-ranking {--city= : ID da cidade} {--state= : ID do estado} {--month= : Mês alvo (1-12)} {--year= : Ano alvo}';

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

        $currentMonth = $this->option('month') ? (int) $this->option('month') : now()->month;
        $currentYear = $this->option('year') ? (int) $this->option('year') : now()->year;

        $citiesQuery = City::query();

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
        // FASE 1: CALCULAR E SALVAR AS NOTAS (COM SUPER DEBUG)
        // =================================================================
        $bar = $this->output->createProgressBar($totalCities);
        $bar->start();

        try {
            $citiesQuery->chunkById(100, function (Collection $cities) use ($bar, $currentMonth, $currentYear) {

                $departmentIds = $cities
                    ->pluck('municipality.departments')
                    ->flatten()
                    ->pluck('id')
                    ->unique()
                    ->toArray();

                if (empty($departmentIds)) {
                    $bar->advance($cities->count());
                    return;
                }

                $statsByDept = DB::table('complaints')
                    ->select('department_id')
                    ->selectRaw('COUNT(id) as total')
                    ->selectRaw('SUM(CASE WHEN status_id = ? THEN 1 ELSE 0 END) as solved', [ComplaintStatus::SOLVED])
                    ->whereIn('department_id', $departmentIds)
                    ->groupBy('department_id')
                    ->get()
                    ->keyBy('department_id');

                $rankingData = [];

                foreach ($cities as $city) {
                    $total = 0;
                    $solved = 0;

                    if ($city->municipality) {
                        foreach ($city->municipality->departments as $department) {
                            if (isset($statsByDept[$department->id])) {
                                $total += $statsByDept[$department->id]->total;
                                $solved += $statsByDept[$department->id]->solved;
                            }
                        }
                    }

                    $resolution = CalcResolutionHelper::calcRaw($total, $solved);

                    $rankingData[] = [
                        'city_id' => $city->id,
                        'state_id' => $city->state_id,
                        'total_complaints' => $total,
                        'solved_complaints' => $solved,
                        'resolution' => $resolution,
                        'rank' => null,
                        'rank_state' => null,
                        'month' => $currentMonth,
                        'year' => $currentYear,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                Ranking::upsert(
                    $rankingData,
                    ['city_id', 'month', 'year'],
                    ['state_id', 'total_complaints', 'solved_complaints', 'resolution', 'updated_at']
                );

                $bar->advance($cities->count());
            });
        } catch (\Throwable $e) {
            $this->error("\n\n[ERRO FATAL CAPTURADO]: " . $e->getMessage() . " | Arquivo: " . $e->getFile() . " | Linha: " . $e->getLine());
            Log::error($e);
            return 1;
        }

        $bar->finish();
        $this->info("\nFase 1 (Cálculo de Notas) concluída.");

        // =================================================================
        // FASE 2: CALCULAR E SALVAR AS POSIÇÕES (CORRIGIDO)
        // =================================================================
        $this->info("Iniciando Fase 2 (Cálculo de Posição Nacional)...");

        $orderedIds = Ranking::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->when($cityId, fn($q) => $q->where('city_id', $cityId))
            ->when($stateId, fn($q) => $q->where('state_id', $stateId))
            ->join('cities', 'rankings.city_id', '=', 'cities.id')
            ->join('states', 'cities.state_id', '=', 'states.id')
            ->orderBy('rankings.resolution', 'desc')
            ->orderBy('rankings.total_complaints', 'desc')
            ->orderBy('cities.name', 'asc')
            ->orderBy('states.uf', 'asc')
            ->pluck('rankings.id');

        if ($orderedIds->isEmpty()) {
            $this->info("\nNenhum ranking encontrado para calcular posições.");
            return 0;
        }

        $position = 1;
        $barRank = $this->output->createProgressBar($orderedIds->count());
        $barRank->start();

        DB::beginTransaction();
        try {
            foreach ($orderedIds as $id) {
                DB::table('rankings')->where('id', $id)->update(['rank' => $position++]);
                $barRank->advance();
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("\nErro ao salvar posições: " . $e->getMessage());
            return 1;
        }

        $barRank->finish();
        $this->info("\nFase 2 concluída! " . $orderedIds->count() . " cidades rankeadas.");
        // =================================================================
        // FASE 3: CÁLCULO DO RANK ESTADUAL (CORRIGIDA)
        // =================================================================
        $this->info("\nIniciando Fase 3 (Cálculo de Posição Estadual)...");

        $stateIdsToRank = [];
        if ($cityId) {
            $city = City::find($cityId);
            $stateIdsToRank = [$city->state_id];
        } elseif ($stateId) {
            $stateIdsToRank = [$stateId];
        } else {
            $this->info("Calculando ranking para todos os estados...");
            $stateIdsToRank = State::pluck('id')->toArray();
        }

        $stateBar = $this->output->createProgressBar(count($stateIdsToRank));
        $stateBar->start();

        foreach ($stateIdsToRank as $sId) {

            $orderedStateIds = Ranking::where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('rankings.state_id', $sId)
                ->join('cities', 'rankings.city_id', '=', 'cities.id')
                ->join('states', 'cities.state_id', '=', 'states.id')
                ->orderBy('rankings.resolution', 'desc')
                ->orderBy('rankings.total_complaints', 'desc')
                ->orderBy('cities.name', 'asc')
                ->orderBy('states.uf', 'asc')
                ->pluck('rankings.id');

            if ($orderedStateIds->isEmpty()) {
                $stateBar->advance();
                continue;
            }

            $position = 1;

            DB::beginTransaction();
            try {
                foreach ($orderedStateIds as $id) {
                    DB::table('rankings')->where('id', $id)->update(['rank_state' => $position++]);
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("\nErro ao salvar posições para o estado ID {$sId}: " . $e->getMessage());
                return 1;
            }

            $stateBar->advance();
        }

        $stateBar->finish();
        $this->info("\nFase 3 (Cálculo de Posições Estaduais) concluída!");
        $this->info("Cálculo de ranking finalizado com sucesso!");
        return 0;
    }
}
