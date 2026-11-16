<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Http\Requests\Municipality\Auth\LoginRequest;
use App\Models\Municipality;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;


class AuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('municipality/auth/login');
    }

    public function login(LoginRequest $request)
    {
        $this->ensureIsNotRateLimited($request);

        $credentials = $request->only('email', 'password');

        $municipality = Municipality::where('email', $request->email)->first();

        if (!$municipality) {
            RateLimiter::hit($this->throttleKey($request));
            return back()->withErrors('Município não encontrado.');
        }

        if (!$municipality->active) {
            return back()->withErrors([
                'email' => 'Essa conta está desativada.',
            ]);
        }

        if (Auth::guard('municipality')->attempt($credentials, $request->filled('remember'))) {
            RateLimiter::clear($this->throttleKey($request));
            $request->session()->regenerate();
            return redirect()->route('municipality.dashboard');
        }

        RateLimiter::hit($this->throttleKey($request));

        return back()->withErrors([
            'email' => 'As credenciais fornecidas não correspondem a nossos registros.',
        ]);
    }

    /**
     * Bloqueia após 5 tentativas por e-mail+IP (mesma política do login de cidadão — RNF013).
     */
    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower((string) $request->input('email')) . '|' . $request->ip() . '|municipality');
    }

    public function logout(Request $request)
    {
        Auth::guard('municipality')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
