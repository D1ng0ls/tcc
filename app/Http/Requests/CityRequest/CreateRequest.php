<?php

namespace App\Http\Requests\CityRequest;

use App\Models\CityRequest;
use App\Models\Municipality;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use App\RequestEnum;

class CreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'city_id' => [
                'bail',
                'required',
                'exists:cities,id',
                // Prefeitura já ativa: a conta institucional existe e é gerida pelo administrador (RF018/RF020).
                function (string $attribute, mixed $value, Closure $fail) {
                    if (Municipality::where('city_id', $value)->where('active', true)->exists()) {
                        $fail('A prefeitura desta cidade já está ativa na plataforma. Para trocar o responsável, fale com o administrador.');
                    }
                },
                // UC008: apenas uma solicitação em aberto por par (cidadão, prefeitura).
                function (string $attribute, mixed $value, Closure $fail) {
                    $pending = CityRequest::where('user_id', $this->user()->id)
                        ->where('city_id', $value)
                        ->where('status', RequestEnum::PENDING->value)
                        ->exists();

                    if ($pending) {
                        $fail('Você já tem uma solicitação pendente para esta cidade. Aguarde a análise do administrador.');
                    }
                },
            ],
            'requester' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'city_id.required' => 'A cidade é obrigatória.',
            'city_id.exists' => 'A cidade selecionada não existe.',
            'requester.required' => 'O nome do solicitante é obrigatório.',
            'requester.max' => 'O nome do solicitante deve ter no máximo 255 caracteres.',
            'email.required' => 'O email do solicitante é obrigatório.',
            'email.email' => 'O email do solicitante deve ser um email válido.',
            'email.max' => 'O email do solicitante deve ter no máximo 255 caracteres.',
        ];
    }
}
