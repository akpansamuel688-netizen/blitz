<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = Account::where('user_id', $user->id)
            ->with(['transactions' => fn ($query) => $query->latest()])
            ->get()
            ->flatMap(fn ($account) => $account->transactions->map(fn ($transaction) => [
                'id' => $transaction->id,
                'transfer_id' => $transaction->transfer_id,
                'transaction_type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => number_format($transaction->amount, 2, '.', ''),
                'created_at' => $transaction->created_at->toDateTimeString(),
                'account_name' => $account->name,
            ]));

        return Inertia::render('transactions/index', [
            'transactions' => $transactions->sortByDesc('created_at')->values()->all(),
        ]);
    }

    public function show(Request $request, Transaction $transaction): Response
    {
        $transaction->load(['account:id,user_id,name,currency', 'transfer.destinationAccount:id,name,account_number']);

        abort_unless($transaction->account?->user_id === $request->user()->id, 403);

        return Inertia::render('transactions/show', [
            'transaction' => [
                'id' => $transaction->id,
                'transaction_type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => Money::format($transaction->amount),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'account_name' => $transaction->account?->name,
                'currency' => $transaction->account?->currency ?? 'USD',
            ],
            'transfer' => $transaction->transfer ? [
                'id' => $transaction->transfer->id,
                'type' => $transaction->transfer->transfer_type,
                'status' => $transaction->transfer->status,
                'amount' => Money::format($transaction->transfer->amount),
                'fee_amount' => Money::format($transaction->transfer->fee_amount),
                'destination_name' => $transaction->transfer->destinationAccount?->name ?? $transaction->transfer->recipient_name,
                'bank_name' => $transaction->transfer->bank_name,
                'reference' => $transaction->transfer->description,
            ] : null,
        ]);
    }
}
