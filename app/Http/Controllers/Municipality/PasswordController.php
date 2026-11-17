<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * "Esqueci a senha" da prefeitura (RF010/UC004): link por e-mail, broker "municipalities".
 * Usa as mesmas telas do cidadão, com as rotas do painel.
 */
class PasswordController extends Controller
{
    private const ROUTES = [
        'email' => 'municipality.password.email',
        'store' => 'municipality.password.store',
        'request' => 'municipality.password.request',
        'login' => 'municipality.login',
    ];

    public function create(Request $request)
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
            'routes' => self::ROUTES,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'O e-mail informado não é válido.',
        ]);

        try {
            Password::broker('municipalities')->sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.');
        }

        // Mesma resposta exista ou não a conta, para não revelar quais e-mails estão cadastrados.
        return back()->with('status', 'Um link para redefinição de senha será enviado caso a conta exista.');
    }

    public function edit(Request $request, string $token)
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->query('email'),
            'token' => $token,
            'routes' => self::ROUTES,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'password.required' => 'A senha é obrigatória.',
            'password.confirmed' => 'As senhas não coincidem.',
        ]);

        // A troca de senha encerra as sessões abertas da prefeitura (middleware municipality.session)
        // e o novo remember_token invalida o "Lembrar-me".
        $status = Password::broker('municipalities')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($municipality) use ($request) {
                $municipality->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PasswordReset) {
            return to_route('municipality.login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
