<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Models\DepartmentUser;
use App\Support\Panel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

/**
 * Usuários de departamento, cadastrados pelo master. O master define uma senha inicial e a
 * pessoa troca depois em "Minha conta".
 */
class DepartmentUserController extends Controller
{
    private function authorizeMember(DepartmentUser $member): void
    {
        abort_unless((int) $member->municipality_id === (int) Panel::municipality()->id, 403);
    }

    private function rules(?DepartmentUser $member = null): array
    {
        $municipalityId = Panel::municipality()->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('department_users', 'email')->ignore($member?->id),
                // O mesmo e-mail não pode ser o login de uma prefeitura.
                Rule::unique('municipalities', 'email'),
            ],
            'department_id' => ['required', Rule::exists('departments', 'id')->where('municipality_id', $municipalityId)],
            // Na edição, senha em branco mantém a atual.
            'password' => [$member ? 'nullable' : 'required', Password::defaults()],
        ];
    }

    private function messages(): array
    {
        return [
            'name.required' => 'Informe o nome.',
            'email.required' => 'Informe o e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já é usado por outra conta.',
            'department_id.required' => 'Escolha o departamento.',
            'department_id.exists' => 'Departamento inválido.',
            'password.required' => 'Defina a senha inicial.',
        ];
    }

    public function index()
    {
        $municipality = Panel::municipality();

        return Inertia::render('municipality/users', [
            'users' => $municipality->departmentUsers()->with('department:id,name')->orderBy('name')->get(),
            'departments' => $municipality->departments()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules(), $this->messages());

        Panel::municipality()->departmentUsers()->create($data);

        return redirect()->back()->with('success', 'Usuário cadastrado. Passe o e-mail e a senha inicial para a pessoa; ela pode trocar a senha em "Minha conta".');
    }

    public function update(Request $request, DepartmentUser $member)
    {
        $this->authorizeMember($member);

        $data = $request->validate($this->rules($member), $this->messages());
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $member->update($data);

        return redirect()->back()->with('success', 'Usuário atualizado.');
    }

    public function destroy(DepartmentUser $member)
    {
        $this->authorizeMember($member);

        $member->delete();

        return redirect()->back()->with('success', 'Usuário removido.');
    }
}
