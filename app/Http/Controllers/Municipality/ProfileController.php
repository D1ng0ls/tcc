<?php

namespace App\Http\Controllers\Municipality;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('municipality/settings', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $municipality = $request->user('municipality');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('municipalities', 'email')->ignore($municipality->id)],
            'cnpj' => ['nullable', 'string', 'max:18', Rule::unique('municipalities', 'cnpj')->ignore($municipality->id)],
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'O e-mail informado não é válido.',
            'email.unique' => 'Este e-mail já está em uso.',
            'cnpj.unique' => 'Este CNPJ já está em uso.',
            'photo.image' => 'O arquivo deve ser uma imagem.',
            'photo.mimes' => 'A imagem deve ser jpg, png, gif ou webp.',
            'photo.max' => 'A imagem deve ter no máximo 5MB.',
        ]);

        $municipality->name = $validated['name'];
        $municipality->email = $validated['email'];
        $municipality->cnpj = $validated['cnpj'] ?? null;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('municipalities', $filename, 'public');
            $municipality->photo_url = '/storage/' . $path;
        }

        $municipality->save();

        return back()->with('success', 'Perfil atualizado com sucesso.');
    }

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

        $municipality = $request->user('municipality');

        if ($municipality->photo_url && Str::startsWith($municipality->photo_url, '/storage/')) {
            Storage::disk('public')->delete(Str::after($municipality->photo_url, '/storage/'));
        }

        $file = $request->file('photo');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('municipalities', $filename, 'public');
        $municipality->photo_url = '/storage/' . $path;
        $municipality->save();

        return back()->with('success', 'Foto atualizada.');
    }

    public function removePhoto(Request $request): RedirectResponse
    {
        $municipality = $request->user('municipality');

        if ($municipality->photo_url && Str::startsWith($municipality->photo_url, '/storage/')) {
            Storage::disk('public')->delete(Str::after($municipality->photo_url, '/storage/'));
        }

        $municipality->photo_url = '';
        $municipality->save();

        return back()->with('success', 'Foto removida.');
    }

    public function password(Request $request): RedirectResponse
    {
        $municipality = $request->user('municipality');

        $validated = $request->validate([
            'current_password' => ['required', function ($attr, $value, $fail) use ($municipality) {
                if (! Hash::check($value, $municipality->password)) {
                    $fail('A senha atual está incorreta.');
                }
            }],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'A senha atual é obrigatória.',
            'password.required' => 'A nova senha é obrigatória.',
            'password.confirmed' => 'As senhas não coincidem.',
        ]);

        $municipality->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Mantém a sessão atual válida (atualiza o hash guardado) e encerra as
        // demais sessões da prefeitura — que ainda têm o hash antigo — no próximo
        // request, via middleware municipality.session (RF012).
        $request->session()->put(
            \App\Http\Middleware\AuthenticateMunicipalitySession::SESSION_KEY,
            $municipality->getAuthPassword()
        );

        return back()->with('success', 'Senha atualizada com sucesso. As sessões em outros dispositivos foram encerradas.');
    }
}
