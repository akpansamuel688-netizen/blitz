<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
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
}
