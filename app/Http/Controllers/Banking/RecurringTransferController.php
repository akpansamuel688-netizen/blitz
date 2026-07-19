<?php

namespace App\Http\Controllers\Banking;

use App\Models\Account;
use App\Models\RecurringTransfer;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransferController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transfers = RecurringTransfer::query()
            ->where('user_id', $user->id)
            ->with(['sourceAccount:id,name', 'destinationAccount:id,name'])
            ->orderBy('next_transfer_date')
            ->get()
            ->map(fn (RecurringTransfer $transfer) => [
                'id' => $transfer->id,
                'source_account' => $transfer->sourceAccount?->name ?? '—',
                'destination_account' => $transfer->destinationAccount?->name ?? '—',
                'amount' => Money::format($transfer->amount),
                'frequency' => $transfer->frequency,
                'next_transfer_date' => $transfer->next_transfer_date?->toDateString(),
                'is_active' => (bool) $transfer->is_active,
                'description' => $transfer->description,
            ]);

        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('recurring-transfers/index', [
            'transfers' => $transfers,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $accountRule = Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('user_id', $user->id));

        $validated = $request->validate([
            'source_account_id' => ['required', $accountRule],
            'destination_account_id' => ['required', $accountRule, 'different:source_account_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:daily,weekly,biweekly,monthly'],
            'next_transfer_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:next_transfer_date'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $user->recurringTransfers()->create([
            ...$validated,
            'is_active' => true,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Recurring transfer scheduled successfully.',
        ]);

        return back();
    }
}
