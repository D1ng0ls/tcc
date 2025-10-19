<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Http\Requests\Municipality\Auth\LoginRequest;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class AuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('municipality/auth/login');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        $municipality = Municipality::where('email', $request->email)->first();

        if (!$municipality) {
            return back()->withErrors('Município não encontrado.');
        }

        if (!$municipality->active) {
            return back()->withErrors([
                'email' => 'Essa conta está desativada.',
            ]);
        }
        
        if (Auth::guard('municipality')->attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();
            return redirect()->route('municipality.dashboard');
        }

        return back()->withErrors([
            'email' => 'As credenciais fornecidas não correspondem a nossos registros.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('municipality')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
