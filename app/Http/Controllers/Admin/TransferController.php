<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
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
            'status' => ['nullable', 'in:failed,completed'],
            'date' => ['nullable', 'date_format:Y-m-d', 'required_with:time'],
            'time' => ['nullable', 'date_format:H:i', 'required_with:date'],
            'recipient_name' => ['nullable', 'string', 'max:150'],
            'bank_name' => ['nullable', 'string', 'max:150'],
            'recipient_account_number' => ['nullable', 'string', 'max:34'],
            'iban' => ['nullable', 'string', 'max:34'],
            'swift_bic' => ['nullable', 'string', 'max:11'],
        ]);

        $newTimestamp = isset($data['date'], $data['time'])
            ? Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['time'])
            : null;

        if (! array_key_exists('amount', $data) && ! array_key_exists('status', $data) && ! $newTimestamp) {
            unset($data['date'], $data['time']);
            $transfer->update($data);

            return back();
        }

        $newAmount = array_key_exists('amount', $data) ? Money::toCents($data['amount']) : null;

        if ($newAmount !== null && $newAmount <= 0) {
            throw ValidationException::withMessages(['amount' => 'The transfer amount must be greater than zero.']);
        }

        DB::transaction(function () use ($transfer, $data, $newAmount, $newTimestamp): void {
            $lockedTransfer = Transfer::query()->lockForUpdate()->findOrFail($transfer->id);
            $newStatus = $data['status'] ?? $lockedTransfer->status;

            $accountIds = array_filter([$lockedTransfer->source_account_id, $lockedTransfer->destination_account_id]);
            $accounts = Account::query()->whereIn('id', $accountIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $source = $accounts->get($lockedTransfer->source_account_id);
            $destination = $lockedTransfer->destination_account_id ? $accounts->get($lockedTransfer->destination_account_id) : null;

            if (! $source || ($lockedTransfer->destination_account_id && ! $destination)) {
                throw ValidationException::withMessages(['amount' => 'A linked account is unavailable for this transfer.']);
            }

            $oldAmount = Money::toCents($lockedTransfer->amount);
            $oldFee = Money::toCents($lockedTransfer->fee_amount);
            $newAmount ??= $oldAmount;
            $newFee = intdiv(($newAmount * 8) + 500, 1000);

            if ($newStatus !== $lockedTransfer->status && $newAmount !== $oldAmount) {
                throw ValidationException::withMessages(['amount' => 'Save an amount correction separately from a transfer status change.']);
            }

            if ($lockedTransfer->status !== 'completed' && $newAmount !== $oldAmount) {
                throw ValidationException::withMessages(['amount' => 'Only completed transfers can have their amount corrected.']);
            }

            $sourceDifference = ($newAmount + $newFee) - ($oldAmount + $oldFee);
            $sourceBalance = Money::toCents($source->balance);
            $destinationBalance = $destination ? Money::toCents($destination->balance) : null;
            $newSourceBalance = $sourceBalance;
            $newDestinationBalance = $destinationBalance;

            if ($lockedTransfer->status === 'completed' && $newStatus === 'failed') {
                $newSourceBalance += $oldAmount + $oldFee;
                $newDestinationBalance = $destination ? $destinationBalance - $oldAmount : null;
            } elseif ($lockedTransfer->status !== 'completed' && $newStatus === 'completed') {
                $newSourceBalance -= $oldAmount + $oldFee;
                $newDestinationBalance = $destination ? $destinationBalance + $oldAmount : null;
            } elseif ($lockedTransfer->status === 'completed') {
                $newSourceBalance -= $sourceDifference;
                $newDestinationBalance = $destination ? $destinationBalance + ($newAmount - $oldAmount) : null;
            }

            if ($newSourceBalance < 0) {
                throw ValidationException::withMessages(['amount' => 'The customer does not have sufficient funds for this transfer change.']);
            }

            if ($destination && $newDestinationBalance < 0) {
                throw ValidationException::withMessages(['status' => 'Failing this internal transfer would make the destination balance negative.']);
            }

            $transactions = Transaction::query()->where('transfer_id', $lockedTransfer->id)->lockForUpdate()->get()->keyBy('account_id');
            $sourceTransaction = $transactions->get($source->id);
            $destinationTransaction = $destination ? $transactions->get($destination->id) : null;

            if (! $sourceTransaction || ($destination && ! $destinationTransaction)) {
                throw ValidationException::withMessages(['amount' => 'The linked ledger entries are incomplete and cannot be corrected automatically.']);
            }

            $description = $data['description'] ?? $lockedTransfer->description;
            $lockedTransfer->forceFill([
                ...Arr::except($data, ['date', 'time']),
                'amount' => Money::fromCents($newAmount),
                'fee_amount' => Money::fromCents($newFee),
                'status' => $newStatus,
                'completed_at' => $newStatus === 'completed' ? ($lockedTransfer->completed_at ?? now()) : null,
                ...($newTimestamp ? ['created_at' => $newTimestamp] : []),
            ])->save();
            $source->update(['balance' => Money::fromCents($newSourceBalance)]);
            $sourceTransaction->update([
                'amount' => Money::fromCents($newAmount + $newFee),
                'status' => $newStatus === 'completed' ? 'completed' : 'failed',
                'description' => $this->sourceDescription($lockedTransfer, $description, $destination),
            ]);

            if ($newTimestamp) {
                $sourceTransaction->forceFill(['created_at' => $newTimestamp])->save();
            }

            if ($destination && $destinationTransaction) {
                $destination->update(['balance' => Money::fromCents($newDestinationBalance)]);
                $destinationTransaction->update([
                    'amount' => Money::fromCents($newAmount),
                    'status' => $newStatus === 'completed' ? 'completed' : 'failed',
                    'description' => $description ?: 'Internal transfer from '.$source->name,
                ]);

                if ($newTimestamp) {
                    $destinationTransaction->forceFill(['created_at' => $newTimestamp])->save();
                }
            }
        });

        return back()->with('success', 'Transfer changes and linked balances were updated.');
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
