<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Garante que o departamento pertence à prefeitura logada. Sem isso,
     * bastaria trocar o id na URL para editar/excluir departamentos de outra prefeitura.
     */
    private function authorizeDepartment(Department $department): void
    {
        if ((int) $department->municipality_id !== (int) auth()->guard('municipality')->user()->id) {
            abort(403);
        }
    }

    private function rules(bool $nameRequired = true): array
    {
        return [
            'name' => $nameRequired ? 'required|string|max:255' : 'nullable',
            'description' => 'nullable|string|max:500',
            'keywords' => 'nullable|string|max:2000',
        ];
    }

    /** Palavras-chave separadas por vírgula, sem espaços sobrando nem repetidas. */
    private function normalizeKeywords(?string $keywords): ?string
    {
        $list = collect(explode(',', (string) $keywords))
            ->map(fn ($word) => trim(preg_replace('/\s+/', ' ', $word)))
            ->filter()
            ->unique(fn ($word) => mb_strtolower($word))
            ->values();

        return $list->isEmpty() ? null : $list->implode(', ');
    }

    public function index()
    {
        $departmentIds = auth()->guard('municipality')
            ->user()
            ->departments()
            ->pluck('id');

        $departments = Department::whereIn('id', $departmentIds)
            ->withCount(['complaints', 'users'])
            ->get();

        return Inertia::render('municipality/departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->rules());

        if(Department::where('name', $request->name)->where('municipality_id', auth()->guard('municipality')->user()->id)->exists()){
            return redirect()->back()->withErrors('Departamento já existe!');
        }

        $municipality = auth()->guard('municipality')->user();

        $municipality->departments()->create([
            'name' => $request->name,
            'description' => $request->description,
            'keywords' => $this->normalizeKeywords($request->keywords),
        ]);

        return redirect()->route('municipality.departments.index')->with('success', 'Departamento criado com sucesso!');
    }

    public function update(Request $request, Department $department)
    {
        $this->authorizeDepartment($department);

        // Departamento padrão: o nome é fixo, mas a prefeitura pode ajustar a descrição e as palavras-chave.
        if($department->is_default){
            $request->validate($this->rules(nameRequired: false));

            $department->update([
                'description' => $request->description,
                'keywords' => $this->normalizeKeywords($request->keywords),
            ]);

            return redirect()->route('municipality.departments.index')->with('success', 'Departamento atualizado com sucesso!');
        }

        $request->validate($this->rules());

        $duplicate = Department::where('municipality_id', $department->municipality_id)
            ->where('name', $request->name)
            ->where('id', '!=', $department->id)
            ->exists();
        if ($duplicate) {
            return redirect()->back()->withErrors('Departamento já existe!');
        }

        $department->update([
            'name' => $request->name,
            'description' => $request->description,
            'keywords' => $this->normalizeKeywords($request->keywords),
        ]);

        return redirect()->route('municipality.departments.index')->with('success', 'Departamento atualizado com sucesso!');
    }

    public function destroy(Department $department)
    {
        $this->authorizeDepartment($department);

        if($department->is_default){
            return redirect()->back()->withErrors('Não é possível excluir um departamento padrão!');
        }

        if ($department->users()->exists()) {
            return redirect()->back()->withErrors('Este departamento tem usuários. Mude-os de departamento ou remova-os em Usuários antes de excluir.');
        }

        // Destino das reclamações realocadas (RF005): o departamento padrão "Outros" da mesma prefeitura.
        $fallbackId = Department::where('municipality_id', $department->municipality_id)
            ->where('name', 'Outros')
            ->where('id', '!=', $department->id)
            ->value('id');

        if (! $fallbackId) {
            return redirect()->back()->withErrors('Departamento "Outros" não encontrado para realocar as reclamações.');
        }

        try {
            DB::transaction(function () use ($department, $fallbackId) {
                $department->complaints()->update([
                    'department_id' => $fallbackId,
                ]);

                $department->delete();
            });
        } catch (\Throwable $e) {
            \Log::error('Erro ao excluir departamento: ' . $e->getMessage());
            return redirect()->back()->withErrors('Erro ao excluir departamento!');
        }

        return redirect()->back()->with('success', 'Departamento excluído com sucesso!');
    }
}
