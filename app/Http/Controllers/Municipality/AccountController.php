<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthenticateMunicipalitySession;
use App\Support\Panel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

/** "Minha conta" do usuário de departamento: nome e troca da senha inicial. */
class AccountController extends Controller
{
    public function edit()
    {
        $member = Panel::member();
        abort_unless($member, 403);

        return Inertia::render('municipality/account', [
            'member' => $member->load('department:id,name'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $member = Panel::member();
        abort_unless($member, 403);

        $member->update($request->validate([
            'name' => ['required', 'string', 'max:255'],
        ], ['name.required' => 'Informe o nome.']));

        return back()->with('success', 'Dados atualizados.');
    }

    public function password(Request $request): RedirectResponse
    {
        $member = Panel::member();
        abort_unless($member, 403);

        $validated = $request->validate([
            'current_password' => ['required', function ($attr, $value, $fail) use ($member) {
                if (! Hash::check($value, $member->password)) {
                    $fail('A senha atual está incorreta.');
                }
            }],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'A senha atual é obrigatória.',
            'password.required' => 'A nova senha é obrigatória.',
            'password.confirmed' => 'As senhas não coincidem.',
        ]);

        $member->update(['password' => $validated['password']]);

        // Mantém esta sessão e encerra as outras dessa pessoa (middleware municipality.session).
        $request->session()->put(AuthenticateMunicipalitySession::MEMBER_SESSION_KEY, $member->fresh()->getAuthPassword());

        return back()->with('success', 'Senha alterada.');
    }
}
