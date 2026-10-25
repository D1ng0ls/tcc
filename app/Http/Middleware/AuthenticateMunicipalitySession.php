<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Equivalente ao AuthenticateSession nativo do Laravel, porém amarrado ao guard
 * "municipality" (o nativo só cobre o guard default 'web').
 *
 * Guarda o hash da senha da prefeitura na sessão e, a cada requisição, compara
 * com o hash atual. Se a senha mudou (troca pela própria prefeitura — RF012 — ou
 * alteração de credenciais pelo administrador — RF020), as demais sessões (que
 * ainda carregam o hash antigo) são encerradas automaticamente.
 */
class AuthenticateMunicipalitySession
{
    public const SESSION_KEY = 'password_hash_municipality';

    /** Mesmo controle para os usuários de departamento (senha trocada por eles ou pelo master). */
    public const MEMBER_SESSION_KEY = 'password_hash_department';

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession()) {
            return $next($request);
        }

        foreach (['municipality' => self::SESSION_KEY, 'department' => self::MEMBER_SESSION_KEY] as $guardName => $key) {
            $guard = Auth::guard($guardName);
            if (! $guard->check()) {
                continue;
            }

            $currentHash = $guard->user()->getAuthPassword();

            if (! $request->session()->has($key)) {
                $request->session()->put($key, $currentHash);
            } elseif (! hash_equals($request->session()->get($key), $currentHash)) {
                $guard->logout();
                $request->session()->flush();

                abort(redirect()->guest(route('municipality.login')));
            }
        }

        return $next($request);
    }
}
