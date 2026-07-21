<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\State;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'states' => State::select('id', 'name', 'uf')->orderBy('name')->get(),
            'cities' => City::select('id', 'name', 'state_id')->orderBy('name')->get(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'cpf' => 'required|string|max:14|unique:'.User::class,
            'birth_date' => 'required|date',
            'city_id' => 'required|exists:cities,id',
            'address' => 'required|string|max:255',
            'consent' => 'accepted',
        ], [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email informado não é válido.',
            'password.required' => 'A senha é obrigatória.',
            'password.confirmed' => 'As senhas não coincidem.',
            'cpf.required' => 'O cpf é obrigatório.',
            'cpf.unique' => 'O cpf informado já está cadastrado.',
            'birth_date.required' => 'A data de nascimento é obrigatória.',
            'city_id.required' => 'A cidade é obrigatória.',
            'city_id.exists' => 'A cidade informada não existe.',
            'address.required' => 'O endereço é obrigatório.',
            'consent.accepted' => 'É necessário aceitar o tratamento dos dados pessoais conforme a LGPD.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'cpf' => $request->cpf,
            'birth_date' => \Carbon\Carbon::parse($request->birth_date)->format('Y-m-d'),
            'city_id' => $request->city_id,
            'address' => $request->address,
            'consent_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
