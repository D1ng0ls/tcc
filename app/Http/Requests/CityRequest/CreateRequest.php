<?php

namespace App\Http\Requests\CityRequest;

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
            'city_id' => 'required|exists:cities,id',
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
