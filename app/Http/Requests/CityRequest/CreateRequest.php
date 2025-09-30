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
            'message' => 'required|string',
            'status' => 'required|in:' . implode(',', RequestEnum::cases()),
        ];
    }
}
