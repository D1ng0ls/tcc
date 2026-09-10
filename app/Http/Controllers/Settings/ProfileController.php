<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        return to_route('profile.edit')->with('success', 'Perfil atualizado com sucesso.');
    }

    /**
     * Upload imediato da foto de perfil (auto-save).
     * Apaga foto anterior se houver.
     */
    public function uploadPhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'photo.required' => 'Selecione uma imagem.',
            'photo.image' => 'O arquivo deve ser uma imagem.',
            'photo.mimes' => 'A imagem deve ser jpg, png, gif ou webp.',
            'photo.max' => 'A imagem deve ter no máximo 5MB.',
        ]);

        $user = $request->user();

        if ($user->photo_url && Str::startsWith($user->photo_url, '/storage/')) {
            Storage::disk('public')->delete(Str::after($user->photo_url, '/storage/'));
        }

        $file = $request->file('photo');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profiles', $filename, 'public');
        $user->photo_url = '/storage/' . $path;
        $user->save();

        return back()->with('success', 'Foto de perfil atualizada.');
    }

    /**
     * Remove a foto de perfil atual.
     */
    public function removePhoto(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->photo_url && Str::startsWith($user->photo_url, '/storage/')) {
            Storage::disk('public')->delete(Str::after($user->photo_url, '/storage/'));
        }

        $user->photo_url = null;
        $user->save();

        return back()->with('success', 'Foto de perfil removida.');
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
