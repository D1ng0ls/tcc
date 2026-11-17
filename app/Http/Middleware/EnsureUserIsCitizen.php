<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCitizen
{
    /**
     * Telas e ações exclusivas do cidadão (dashboard do cidadão, minhas reclamações,
     * registrar reclamação e solicitar perfil de gestor - UC008, UC009, UC010, UC013).
     * O administrador é levado ao seu próprio painel (UC002).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth('web')->user()?->role === 'admin') {
            $redirect = redirect()->route('admin.dashboard');

            return $request->isMethod('GET')
                ? $redirect
                : $redirect->with('error', 'Esta ação é exclusiva de cidadãos.');
        }

        return $next($request);
    }
}
