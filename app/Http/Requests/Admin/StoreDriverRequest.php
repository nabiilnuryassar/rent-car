<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'license_number' => ['required', 'string', 'max:50', 'unique:drivers,license_number'],
            'password' => ['required', 'string', 'min:8'],
            'professional_title' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['required', 'integer', 'min:0'],
        ];
    }
}
