<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Neighborhood;
use App\Models\NeighborhoodSuggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NeighborhoodController extends Controller
{
    /**
     * Garante que o bairro pertence à cidade da prefeitura logada. Sem isso,
     * bastaria trocar o id na URL para editar/excluir bairros de outra cidade.
     */
    private function authorizeNeighborhood(Neighborhood $neighborhood): void
    {
        if ((int) $neighborhood->city_id !== (int) auth()->guard('municipality')->user()->city_id) {
            abort(403);
        }
    }

    public function index()
    {
        $municipality = auth()->guard('municipality')->user();

        $departmentIds = $municipality->departments()->pluck('id');

        $outrosCount = Complaint::whereIn('department_id', $departmentIds)
            ->whereNull('neighborhood_id')
            ->count();

        $neighborhoods = $municipality->city->neighborhoods()
            ->withCount(['complaints' => function ($q) use ($departmentIds) {
                $q->whereIn('department_id', $departmentIds);
            }])
            ->get()
            ->toArray();

        $neighborhoods[] = [
            'id' => null,
            'name' => 'Outros',
            'complaints_count' => $outrosCount,
        ];

        // Sugestões pendentes para esta cidade
        $pendingSuggestions = NeighborhoodSuggestion::where('city_id', $municipality->city_id)
            ->where('status', 'pending')
            ->orderByDesc('hits')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('municipality/neighborhoods', [
            'neighborhoods' => $neighborhoods,
            'pendingSuggestions' => $pendingSuggestions,
        ]);
    }

    /**
     * Aprova uma sugestão: cria neighborhood real e vincula as complaints
     * com aquele district (case-insensitive) ao novo bairro.
     */
    public function approveSuggestion(NeighborhoodSuggestion $suggestion)
    {
        $municipality = auth()->guard('municipality')->user();
        if ($suggestion->city_id !== $municipality->city_id) {
            abort(403);
        }
        if ($suggestion->status !== 'pending') {
            return redirect()->back()->with('info', 'Esta sugestão já foi resolvida.');
        }

        DB::transaction(function () use ($suggestion, $municipality) {
            // Cria o bairro de verdade (reutiliza se já existe com o mesmo nome)
            $neighborhood = Neighborhood::firstOrCreate(
                ['city_id' => $suggestion->city_id, 'name' => $suggestion->name],
            );

            $suggestion->update([
                'status' => 'approved',
                'approved_neighborhood_id' => $neighborhood->id,
                'resolved_by_municipality_id' => $municipality->id,
                'resolved_at' => now(),
            ]);

            // Vincula ao novo neighborhood as complaints DESTA prefeitura com o district
            // idêntico. O escopo pelos departamentos impede capturar reclamações de
            // outras cidades que usaram o mesmo nome livre (ex.: "Centro").
            Complaint::whereIn('department_id', $municipality->departments()->pluck('id'))
                ->whereNull('neighborhood_id')
                ->where('district', $suggestion->name)
                ->update([
                    'neighborhood_id' => $neighborhood->id,
                    'district' => null,
                ]);
        });

        return redirect()->back()->with('success', 'Bairro aprovado e adicionado.');
    }

    /**
     * Ignora uma sugestão: não cria neighborhood. O district fica só na complaint original.
     */
    public function ignoreSuggestion(NeighborhoodSuggestion $suggestion)
    {
        $municipality = auth()->guard('municipality')->user();
        if ($suggestion->city_id !== $municipality->city_id) {
            abort(403);
        }
        if ($suggestion->status !== 'pending') {
            return redirect()->back()->with('info', 'Esta sugestão já foi resolvida.');
        }

        $suggestion->update([
            'status' => 'ignored',
            'resolved_by_municipality_id' => $municipality->id,
            'resolved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Sugestão ignorada.');
    }

    public function store(Request $request)
    {
        $city = auth()->guard('municipality')->user()->city;

        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('neighborhoods', 'name')->where('city_id', $city->id)],
        ], [
            'name.required' => 'O nome do bairro é obrigatório.',
            'name.unique' => 'Já existe um bairro com esse nome nesta cidade.',
        ]);

        $city->neighborhoods()->create($request->only('name'));

        return redirect()->route('municipality.neighborhoods.index')->with('success', 'Bairro criado com sucesso!');
    }

    public function update(Request $request, Neighborhood $neighborhood)
    {
        $this->authorizeNeighborhood($neighborhood);

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('neighborhoods', 'name')->where('city_id', $neighborhood->city_id)->ignore($neighborhood->id),
            ],
        ], [
            'name.required' => 'O nome do bairro é obrigatório.',
            'name.unique' => 'Já existe um bairro com esse nome nesta cidade.',
        ]);

        $neighborhood->update($request->only('name'));

        return redirect()->back()->with('success', 'Bairro atualizado com sucesso!');
    }

    public function destroy(Neighborhood $neighborhood)
    {
        $this->authorizeNeighborhood($neighborhood);

        try {
            DB::transaction(function () use ($neighborhood) {
                // As reclamações vinculadas mantêm o nome como texto livre ("Outros").
                $neighborhood->complaints()->update([
                    'district' => $neighborhood->name,
                    'neighborhood_id' => null,
                ]);

                $neighborhood->delete();
            });
        } catch (\Throwable $e) {
            \Log::error('Erro ao excluir bairro: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao excluir bairro!');
        }

        return redirect()->back()->with('success', 'Bairro excluído com sucesso!');
    }
}
