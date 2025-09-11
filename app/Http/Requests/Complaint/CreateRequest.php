<?php

namespace App\Http\Requests\Complaint;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'state_id' => 'required|exists:states,id',
            'city_id' => 'required|exists:cities,id',
            'neighborhood_id' => [
                'nullable',
                'exists:neighborhoods,id',
            ],
            'district' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () {
                    return request('neighborhood_id') === null;
                }),
                'prohibited_if:neighborhood_id,!null',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'O título é obrigatório',
            'description.required' => 'A descrição é obrigatória',
            'department_id.required' => 'O departamento é obrigatório',
            'state_id.required' => 'O estado é obrigatório',
            'city_id.required' => 'A cidade é obrigatória',
            'neighborhood_id.exists' => 'O bairro não existe',
            'district.required_without:neighborhood_id' => 'O distrito é obrigatório quando não houver bairro',
            'district.prohibited_if:neighborhood_id,!null' => 'O distrito não pode ser informado quando houver bairro',
        ];
    }
}
