<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Garante que apenas usuários autenticados no guard "web" e com
     * papel de administrador acessem a área administrativa.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('web')->user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Acesso restrito a administradores.');
        }

        return $next($request);
    }
}
