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
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:65535',
            'department_id' => 'required|exists:departments,id',
            'state_id' => 'required|exists:states,id',
            'city_id' => 'required|exists:cities,id',
            'address' => 'required|string|max:255',
            'neighborhood_id' => [
                'nullable',
                'exists:neighborhoods,id',
            ],
            'district' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn() => !$this->neighborhood_id),
                'prohibited_unless:neighborhood_id,null',
            ],
            'images' => 'nullable|array|max:5',
            'images.*' => [
                'file',
                'max:10240',
                'mimetypes:image/jpeg,image/png,image/jpg,image/webp,image/gif,video/mp4,video/quicktime,video/x-ms-wmv,video/x-flv',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'O título é obrigatório.',
            'description.required' => 'A descrição é obrigatória.',
            'department_id.required' => 'O departamento é obrigatório.',
            'state_id.required' => 'O estado é obrigatório.',
            'city_id.required' => 'A cidade é obrigatória.',
            'address.required' => 'O endereço é obrigatório.',
            'neighborhood_id.exists' => 'O bairro selecionado não é válido.',
            'district.required' => 'Por favor, informe o nome do bairro.',
            'district.prohibited_unless' => 'O campo bairro (outro) não pode ser preenchido quando um bairro da lista é selecionado.',
            'images.max' => 'Você pode enviar no máximo 5 arquivos.',
            'images.*.mimetypes' => 'O arquivo deve ser uma imagem (JPG, PNG) ou vídeo (MP4).',
            'images.*.max' => 'Cada arquivo deve ter no máximo 10MB.',
        ];
    }
}