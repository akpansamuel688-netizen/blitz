<?php

namespace App\Http\Requests\Banking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;
        $ownedAccount = Rule::exists('accounts', 'id')->where('user_id', $userId);
        $ownedBeneficiary = Rule::exists('beneficiaries', 'id')->where('user_id', $userId);
        $needsRecipientDetails = in_array($this->input('transfer_type'), ['domestic', 'wire'], true) && ! $this->filled('beneficiary_id');

        return [
            'transfer_type' => ['required', Rule::in(['internal', 'domestic', 'wire'])],
            'source_account_id' => ['required', $ownedAccount],
            'destination_account_id' => [Rule::requiredIf($this->input('transfer_type') === 'internal'), 'nullable', $ownedAccount, 'different:source_account_id'],
            'amount' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/', 'not_in:0,0.0,0.00'],
            'beneficiary_id' => ['nullable', $ownedBeneficiary],
            'save_beneficiary' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:255'],
            'recipient_name' => [Rule::requiredIf($needsRecipientDetails), 'nullable', 'string', 'max:150'],
            'recipient_account_number' => [Rule::requiredIf($needsRecipientDetails && $this->input('transfer_type') === 'domestic'), 'nullable', 'string', 'max:34', 'regex:/^[A-Za-z0-9 -]+$/'],
            'bank_name' => [Rule::requiredIf($needsRecipientDetails && $this->input('transfer_type') === 'domestic'), 'nullable', 'string', 'max:150'],
            'swift_bic' => [Rule::requiredIf($needsRecipientDetails && $this->input('transfer_type') === 'wire'), 'nullable', 'regex:/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/'],
            'iban' => [Rule::requiredIf($needsRecipientDetails && $this->input('transfer_type') === 'wire'), 'nullable', 'regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/'],
            'wire_bank_name' => [Rule::requiredIf($needsRecipientDetails && $this->input('transfer_type') === 'wire'), 'nullable', 'string', 'max:150'],
            'destination_country' => [Rule::requiredIf($this->input('transfer_type') === 'wire'), 'nullable', Rule::in(array_keys(config('wire.destinations')))],
            'recipient_currency' => [Rule::requiredIf($this->input('transfer_type') === 'wire'), 'nullable', Rule::in(array_values(config('wire.destinations')))],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'swift_bic' => $this->filled('swift_bic') ? strtoupper(str_replace(' ', '', (string) $this->input('swift_bic'))) : null,
            'iban' => $this->filled('iban') ? strtoupper(str_replace(' ', '', (string) $this->input('iban'))) : null,
            'recipient_currency' => config('wire.destinations.'.$this->input('destination_country')),
        ]);
    }
}
