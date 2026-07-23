<?php

namespace App\Services\Banking;

use App\Models\Account;
use App\Models\Beneficiary;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransferService
{
    /** @param array<string, mixed> $data */
    public function create(User $user, array $data): Transfer
    {
        return DB::transaction(function () use ($user, $data): Transfer {
            User::query()->lockForUpdate()->findOrFail($user->id);
            $sourceId = (int) $data['source_account_id'];
            $destinationId = $data['transfer_type'] === 'internal' ? (int) $data['destination_account_id'] : null;
            $beneficiary = $this->beneficiary($user, $data);

            $lockedAccounts = Account::query()
                ->where('user_id', $user->id)
                ->whereIn('id', array_filter([$sourceId, $destinationId]))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $source = $lockedAccounts->get($sourceId);
            $destination = $destinationId ? $lockedAccounts->get($destinationId) : null;

            if (! $source || ($destinationId && ! $destination)) {
                throw ValidationException::withMessages(['source_account_id' => 'One of the selected accounts is unavailable.']);
            }

            if ($destination && $source->currency !== $destination->currency) {
                throw ValidationException::withMessages(['destination_account_id' => 'Internal transfers require accounts with the same currency.']);
            }

            $amountInCents = Money::toCents($data['amount']);
            $feeInCents = intdiv(($amountInCents * 8) + 500, 1000);
            $sourceBalanceInCents = Money::toCents($source->balance);

            if ($amountInCents <= 0) {
                throw ValidationException::withMessages(['amount' => 'The transfer amount must be greater than zero.']);
            }

            if ($amountInCents + $feeInCents > $sourceBalanceInCents) {
                throw ValidationException::withMessages(['amount' => 'Insufficient funds for this transfer.']);
            }

            $transfer = Transfer::query()->create([
                'user_id' => $user->id,
                'source_account_id' => $source->id,
                'destination_account_id' => $destination?->id,
                'transfer_type' => $data['transfer_type'],
                'status' => 'pending',
                'amount' => Money::fromCents($amountInCents),
                'fee_amount' => Money::fromCents($feeInCents),
                'currency' => $source->currency,
                'recipient_name' => $beneficiary?->name ?? $data['recipient_name'] ?? null,
                'recipient_account_number' => $beneficiary?->account_number ?? $data['recipient_account_number'] ?? $data['iban'] ?? null,
                'bank_name' => $beneficiary?->bank_name ?? $data['bank_name'] ?? $data['wire_bank_name'] ?? null,
                'swift_bic' => $beneficiary?->swift_bic ?? $data['swift_bic'] ?? null,
                'iban' => $beneficiary?->iban ?? $data['iban'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            $source->update(['balance' => Money::fromCents($sourceBalanceInCents - $amountInCents - $feeInCents)]);

            Transaction::query()->create([
                'account_id' => $source->id,
                'transfer_id' => $transfer->id,
                'transaction_type' => 'Debit',
                'amount' => Money::fromCents($amountInCents + $feeInCents),
                'description' => $this->debitDescription($transfer, $destination),
            ]);

            if ($destination) {
                $destination->update(['balance' => Money::fromCents(Money::toCents($destination->balance) + $amountInCents)]);

                Transaction::query()->create([
                    'account_id' => $destination->id,
                    'transfer_id' => $transfer->id,
                    'transaction_type' => 'Credit',
                    'amount' => Money::fromCents($amountInCents),
                    'description' => $data['description'] ?: 'Internal transfer from '.$source->name,
                ]);
            }

            $transfer->update(['status' => 'completed', 'completed_at' => now()]);

            if ($this->shouldSaveBeneficiary($data)) {
                $user->beneficiaries()->firstOrCreate([
                    'transfer_type' => $transfer->transfer_type,
                    'name' => $transfer->recipient_name,
                    'account_number' => $transfer->recipient_account_number,
                    'bank_name' => $transfer->bank_name,
                ], [
                    'swift_bic' => $transfer->swift_bic,
                    'iban' => $transfer->iban,
                ]);
            }

            return $transfer;
        }, attempts: 3);
    }

    /** @param array<string, mixed> $data */
    private function beneficiary(User $user, array $data): ?Beneficiary
    {
        if (empty($data['beneficiary_id'])) {
            return null;
        }

        $beneficiary = Beneficiary::query()->where('user_id', $user->id)->findOrFail($data['beneficiary_id']);

        if ($beneficiary->transfer_type !== $data['transfer_type']) {
            throw ValidationException::withMessages(['beneficiary_id' => 'Choose a recipient that matches the transfer type.']);
        }

        return $beneficiary;
    }

    /** @param array<string, mixed> $data */
    private function shouldSaveBeneficiary(array $data): bool
    {
        return ($data['save_beneficiary'] ?? false) && in_array($data['transfer_type'], ['domestic', 'wire'], true);
    }

    private function debitDescription(Transfer $transfer, ?Account $destination): string
    {
        if ($transfer->description) {
            return $transfer->fee_amount > 0 ? $transfer->description.' (includes fee)' : $transfer->description;
        }

        return match ($transfer->transfer_type) {
            'internal' => 'Internal transfer to '.$destination?->name,
            'domestic' => 'Domestic transfer to '.$transfer->recipient_name,
            'wire' => 'Wire transfer to '.$transfer->recipient_name,
        };
    }
}
