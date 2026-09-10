<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Neighborhood;
use App\Models\NeighborhoodSuggestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NeighborhoodController extends Controller
{
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

            // Vincula complaints existentes com o district idêntico ao novo neighborhood
            Complaint::whereNull('neighborhood_id')
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
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $city = auth()->guard('municipality')->user()->city;

        $city->neighborhoods()->create($request->only('name'));

        return redirect()->route('municipality.neighborhoods.index')->with('success', 'Bairro criado com sucesso!');
    }

    public function update(Request $request, Neighborhood $neighborhood)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $neighborhood->update($request->only('name'));

        return redirect()->back()->with('success', 'Bairro atualizado com sucesso!');
    }

    public function destroy(Neighborhood $neighborhood)
    {
        DB::beginTransaction();

        try {
            $districtName = $neighborhood->name;

            $neighborhood->complaints()->update([
                'district' => $districtName,
                'neighborhood_id' => null,
            ]);

            $neighborhood->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Bairro excluído com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro ao excluir bairro: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erro ao excluir bairro!');
        }

        return redirect()->back()->with('success', 'Bairro excluído com sucesso!');
    }
}
