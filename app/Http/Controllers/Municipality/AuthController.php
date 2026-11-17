<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use App\Http\Requests\Municipality\Auth\LoginRequest;
use App\Models\Municipality;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;


class AuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('municipality/auth/login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    public function login(LoginRequest $request)
    {
        $this->ensureIsNotRateLimited($request);

        $credentials = $request->only('email', 'password');

        $municipality = Municipality::where('email', $request->email)->first();

        // Mensagem genérica (UC002): não revela se o e-mail existe nem qual campo está errado.
        if (! $municipality || ! Hash::check($request->password, $municipality->password)) {
            $this->hit($request);

            return back()->withErrors([
                'email' => 'E-mail ou senha incorretos.',
            ]);
        }

        // Só depois de a senha conferir é que se informa que a conta está desativada.
        if (! $municipality->active) {
            return back()->withErrors([
                'email' => 'Essa conta está desativada.',
            ]);
        }

        if (Auth::guard('municipality')->attempt($credentials, $request->filled('remember'))) {
            RateLimiter::clear($this->throttleKey($request));
            $request->session()->regenerate();
            return redirect()->route('municipality.dashboard');
        }

        $this->hit($request);

        return back()->withErrors([
            'email' => 'E-mail ou senha incorretos.',
        ]);
    }

    /**
     * Limite de tentativas de login por IP, com número e janela configuráveis (RNF013).
     */
    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), (int) config('auth.login_throttle.max_attempts'))) {
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

    protected function hit(Request $request): void
    {
        RateLimiter::hit($this->throttleKey($request), 60 * (int) config('auth.login_throttle.decay_minutes'));
    }

    protected function throttleKey(Request $request): string
    {
        return 'login:municipality|' . $request->ip();
    }

    /**
     * Sai do painel e volta para a tela de login do painel (UC003).
     */
    public function logout(Request $request)
    {
        Auth::guard('municipality')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('municipality.login');
    }
}
