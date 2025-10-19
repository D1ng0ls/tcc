<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Neighborhood;
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

        return Inertia::render('municipality/neighborhoods', [
            'neighborhoods' => $neighborhoods,
        ]);
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
