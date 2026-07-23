<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransferController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $type = $request->string('type')->toString();

        $transfers = Transfer::query()
            ->with(['user:id,name,email', 'sourceAccount:id,name', 'destinationAccount:id,name'])
            ->when(in_array($status, ['pending', 'completed', 'failed'], true), fn ($query) => $query->where('status', $status))
            ->when(in_array($type, ['internal', 'domestic', 'wire'], true), fn ($query) => $query->where('transfer_type', $type))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Transfer $transfer) => [
                'id' => $transfer->id,
                'type' => $transfer->transfer_type,
                'status' => $transfer->status,
                'amount' => Money::format($transfer->amount),
                'fee' => Money::format($transfer->fee_amount),
                'currency' => $transfer->currency,
                'customer' => $transfer->user?->name ?? 'Deleted user',
                'customer_email' => $transfer->user?->email ?? '',
                'source_account' => $transfer->sourceAccount?->name ?? 'Account',
                'recipient' => $transfer->destinationAccount?->name ?? $transfer->recipient_name,
                'bank_name' => $transfer->bank_name,
                'description' => $transfer->description,
                'created_at' => $transfer->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/transfers', [
            'transfers' => $transfers,
            'filters' => ['status' => $status, 'type' => $type],
        ]);
    }

    public function update(Request $request, Transfer $transfer): RedirectResponse
    {
        $data = $request->validate([
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'regex:/^\d{1,16}(\.\d{1,2})?$/'],
            'recipient_name' => ['nullable', 'string', 'max:150'],
            'bank_name' => ['nullable', 'string', 'max:150'],
            'recipient_account_number' => ['nullable', 'string', 'max:34'],
            'iban' => ['nullable', 'string', 'max:34'],
            'swift_bic' => ['nullable', 'string', 'max:11'],
        ]);

        if (! array_key_exists('amount', $data)) {
            $transfer->update($data);

            return back();
        }

        $newAmount = Money::toCents($data['amount']);

        if ($newAmount <= 0) {
            throw ValidationException::withMessages(['amount' => 'The transfer amount must be greater than zero.']);
        }

        DB::transaction(function () use ($transfer, $data, $newAmount): void {
            $lockedTransfer = Transfer::query()->lockForUpdate()->findOrFail($transfer->id);

            if ($lockedTransfer->status !== 'completed') {
                throw ValidationException::withMessages(['amount' => 'Only completed transfers can be financially corrected.']);
            }

            $accountIds = array_filter([$lockedTransfer->source_account_id, $lockedTransfer->destination_account_id]);
            $accounts = Account::query()->whereIn('id', $accountIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $source = $accounts->get($lockedTransfer->source_account_id);
            $destination = $lockedTransfer->destination_account_id ? $accounts->get($lockedTransfer->destination_account_id) : null;

            if (! $source || ($lockedTransfer->destination_account_id && ! $destination)) {
                throw ValidationException::withMessages(['amount' => 'A linked account is unavailable for this transfer.']);
            }

            $oldAmount = Money::toCents($lockedTransfer->amount);
            $oldFee = Money::toCents($lockedTransfer->fee_amount);
            $newFee = intdiv(($newAmount * 8) + 500, 1000);
            $sourceDifference = ($newAmount + $newFee) - ($oldAmount + $oldFee);
            $newSourceBalance = Money::toCents($source->balance) - $sourceDifference;

            if ($newSourceBalance < 0) {
                throw ValidationException::withMessages(['amount' => 'The customer does not have sufficient funds for this corrected transfer amount.']);
            }

            $newDestinationBalance = null;
            if ($destination) {
                $newDestinationBalance = Money::toCents($destination->balance) + ($newAmount - $oldAmount);

                if ($newDestinationBalance < 0) {
                    throw ValidationException::withMessages(['amount' => 'Reducing this internal transfer would make the destination balance negative.']);
                }
            }

            $transactions = Transaction::query()->where('transfer_id', $lockedTransfer->id)->lockForUpdate()->get()->keyBy('account_id');
            $sourceTransaction = $transactions->get($source->id);
            $destinationTransaction = $destination ? $transactions->get($destination->id) : null;

            if (! $sourceTransaction || ($destination && ! $destinationTransaction)) {
                throw ValidationException::withMessages(['amount' => 'The linked ledger entries are incomplete and cannot be corrected automatically.']);
            }

            $description = $data['description'] ?? $lockedTransfer->description;
            $lockedTransfer->update([
                ...$data,
                'amount' => Money::fromCents($newAmount),
                'fee_amount' => Money::fromCents($newFee),
            ]);
            $source->update(['balance' => Money::fromCents($newSourceBalance)]);
            $sourceTransaction->update([
                'amount' => Money::fromCents($newAmount + $newFee),
                'description' => $this->sourceDescription($lockedTransfer, $description, $destination),
            ]);

            if ($destination && $destinationTransaction) {
                $destination->update(['balance' => Money::fromCents($newDestinationBalance)]);
                $destinationTransaction->update([
                    'amount' => Money::fromCents($newAmount),
                    'description' => $description ?: 'Internal transfer from '.$source->name,
                ]);
            }
        });

        return back()->with('success', 'Transfer amount, fee, and linked balances were updated.');
    }

    private function sourceDescription(Transfer $transfer, ?string $description, ?Account $destination): string
    {
        if ($description) {
            return $transfer->fee_amount > 0 ? $description.' (includes fee)' : $description;
        }

        return match ($transfer->transfer_type) {
            'internal' => 'Internal transfer to '.$destination?->name,
            'domestic' => 'Domestic transfer to '.$transfer->recipient_name,
            'wire' => 'Wire transfer to '.$transfer->recipient_name,
        };
    }
}
