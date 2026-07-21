<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Services\Banking\TransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)->get();
        $totalBalance = $accounts->sum('balance');

        return Inertia::render('accounts/index', [
            'accounts' => $accounts->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'account_number' => $account->account_number,
                'balance' => number_format($account->balance, 2, '.', ''),
                'currency' => $account->currency,
            ]),
            'totalBalance' => number_format($totalBalance, 2, '.', ''),
            'accountCount' => $accounts->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:Checking,Savings'],
            'currency' => ['required', 'string', 'size:3'],
            'initial_balance' => ['required', 'numeric', 'min:0'],
        ]);

        $accountNumber = strval(rand(1000000000, 9999999999));

        $request->user()->accounts()->create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'currency' => strtoupper($validated['currency']),
            'balance' => round((float) $validated['initial_balance'], 2),
            'account_number' => $accountNumber,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Account created successfully.',
        ]);

        return back();
    }

    public function show(Request $request, Account $account): Response
    {
        if ($request->user()->id !== $account->user_id) {
            abort(403);
        }

        $otherAccounts = Account::where('user_id', $request->user()->id)
            ->where('id', '!=', $account->id)
            ->get();

        return Inertia::render('accounts/show', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'account_number' => $account->account_number,
                'balance' => number_format($account->balance, 2, '.', ''),
                'currency' => $account->currency,
            ],
            'otherAccounts' => $otherAccounts->map(fn ($other) => [
                'id' => $other->id,
                'name' => $other->name,
                'account_number' => $other->account_number,
                'currency' => $other->currency,
            ]),
            'transactions' => $account->transactions()
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($transaction) => [
                    'id' => $transaction->id,
                    'transaction_type' => $transaction->transaction_type,
                    'description' => $transaction->description,
                    'amount' => number_format($transaction->amount, 2, '.', ''),
                    'created_at' => $transaction->created_at->toDateTimeString(),
                    'account_name' => $account->name,
                ]),
        ]);
    }

    public function transfer(Request $request, Account $account, TransferService $transferService): RedirectResponse
    {
        if ($request->user()->id !== $account->user_id) {
            abort(403);
        }

        $data = $request->validate([
            'destination_account_id' => ['required', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $transferService->create($request->user(), [
            ...$data,
            'transfer_type' => 'internal',
            'source_account_id' => $account->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Transfer completed successfully.',
        ]);

        return back();
    }
}
