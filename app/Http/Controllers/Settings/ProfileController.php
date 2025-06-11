<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ], [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O email é obrigatório.',
            'email.email' => 'O email informado não é válido.',
            'photo.max' => 'A imagem deve ter no máximo 5MB.',
            'photo.image' => 'O arquivo deve ser uma imagem.',
            'photo.mimes' => 'O arquivo deve ser uma imagem.',
        ]);

        $user = $request->user();

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');

            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            $path = $file->storeAs('profiles', $filename, 'public');

            $user->photo_url = '/storage/'.$path;
        }

        $user->save();

        return to_route('profile.edit');
    }

    public function address(Request $request): RedirectResponse
    {
        $request->validate([
            'address' => 'required|string|max:255',
            'city' => 'required|exists:cities,id',
        ], [
            'address.required' => 'O endereço é obrigatório.',
            'city.required' => 'A cidade é obrigatória.',
            'city.exists' => 'A cidade informada não existe.',
        ]);

        Auth::user()->update([
            'address' => $request->address,
            'city_id' => $request->city,
        ]);

        return redirect()->route('address.edit')->with('success', 'Endereço atualizado com sucesso!');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required' => 'A senha é obrigatória.',
            'password.current_password' => 'A senha informada não é a senha atual.',
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
