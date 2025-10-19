<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departmentIds = auth()->guard('municipality')
            ->user()
            ->departments()
            ->pluck('id');

        $departments = Department::whereIn('id', $departmentIds)
            ->withCount('complaints')
            ->get();

        return Inertia::render('municipality/departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if(Department::where('name', $request->name)->where('municipality_id', auth()->guard('municipality')->user()->id)->exists()){
            return redirect()->back()->withErrors('Departamento já existe!');
        }

        $municipality = auth()->guard('municipality')->user();

        $municipality->departments()->create($request->only('name'));

        return redirect()->route('municipality.departments.index')->with('success', 'Departamento criado com sucesso!');
    }

    public function update(Request $request, Department $department)
    {
        if($department->is_default){
            return redirect()->back()->withErrors('Não é possível editar um departamento padrão!');
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $department->update($request->only('name'));

        return redirect()->route('municipality.departments.index')->with('success', 'Departamento atualizado com sucesso!');
    }

    public function destroy(Department $department)
    {
        DB::beginTransaction();

        if($department->is_default){
            return redirect()->back()->withErrors('Não é possível excluir um departamento padrão!');
        }

        try {
            $departmentId= auth()->guard('municipality')->user()->departments()->where('name', 'Outros')->first()->pluck('id');

            $department->complaints()->update([
                'department_id' => $departmentId,
            ]);

            $department->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Departamento excluído com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro ao excluir departamento: ' . $e->getMessage());
            return redirect()->back()->withErrors('Erro ao excluir departamento!');
        }
    }
}
