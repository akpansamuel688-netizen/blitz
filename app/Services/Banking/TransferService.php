<?php

namespace App\Services\Banking;

use App\Models\Account;
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
            $sourceId = (int) $data['source_account_id'];
            $destinationId = $data['transfer_type'] === 'internal' ? (int) $data['destination_account_id'] : null;

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
            $sourceBalanceInCents = Money::toCents($source->balance);

            if ($amountInCents <= 0) {
                throw ValidationException::withMessages(['amount' => 'The transfer amount must be greater than zero.']);
            }

            if ($amountInCents > $sourceBalanceInCents) {
                throw ValidationException::withMessages(['amount' => 'Insufficient funds for this transfer.']);
            }

            $transfer = Transfer::query()->create([
                'user_id' => $user->id,
                'source_account_id' => $source->id,
                'destination_account_id' => $destination?->id,
                'transfer_type' => $data['transfer_type'],
                'status' => 'pending',
                'amount' => Money::fromCents($amountInCents),
                'currency' => $source->currency,
                'recipient_name' => $data['recipient_name'] ?? null,
                'recipient_account_number' => $data['recipient_account_number'] ?? $data['iban'] ?? null,
                'bank_name' => $data['bank_name'] ?? $data['wire_bank_name'] ?? null,
                'swift_bic' => $data['swift_bic'] ?? null,
                'iban' => $data['iban'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            $source->update(['balance' => Money::fromCents($sourceBalanceInCents - $amountInCents)]);

            Transaction::query()->create([
                'account_id' => $source->id,
                'transfer_id' => $transfer->id,
                'transaction_type' => 'Debit',
                'amount' => Money::fromCents($amountInCents),
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

            return $transfer;
        }, attempts: 3);
    }

    private function debitDescription(Transfer $transfer, ?Account $destination): string
    {
        if ($transfer->description) {
            return $transfer->description;
        }

        return match ($transfer->transfer_type) {
            'internal' => 'Internal transfer to '.$destination?->name,
            'domestic' => 'Domestic transfer to '.$transfer->recipient_name,
            'wire' => 'Wire transfer to '.$transfer->recipient_name,
        };
    }
}
