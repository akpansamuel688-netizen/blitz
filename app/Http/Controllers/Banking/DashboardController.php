<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->orderByDesc('balance')
            ->get();

        $accountIds = $accounts->pluck('id');
        $totalBalance = (float) $accounts->sum('balance');

        $since = Carbon::now()->subDays(30);

        $periodTransactions = Transaction::query()
            ->whereIn('account_id', $accountIds)
            ->where('created_at', '>=', $since)
            ->get();

        $completedTransactions = Transaction::query()
            ->whereIn('account_id', $accountIds)
            ->where('status', 'completed')
            ->get();

        $moneyIn = (float) $completedTransactions
            ->where('transaction_type', 'Credit')
            ->sum('amount');

        $moneyOut = (float) $completedTransactions
            ->where('transaction_type', 'Debit')
            ->sum('amount');

        $recentTransactions = Transaction::query()
            ->with('account:id,name,currency')
            ->whereIn('account_id', $accountIds)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'transaction_type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => Money::format($transaction->amount),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'account_name' => $transaction->account?->name ?? 'Account',
                'currency' => $transaction->account?->currency ?? 'USD',
            ]);

        $activityByDay = collect(range(6, 0))->map(function (int $daysAgo) use ($accountIds) {
            $day = Carbon::now()->subDays($daysAgo)->startOfDay();
            $end = $day->copy()->endOfDay();

            $dayTx = Transaction::query()
                ->whereIn('account_id', $accountIds)
                ->whereBetween('created_at', [$day, $end])
                ->get();

            return [
                'date' => $day->toDateString(),
                'label' => $day->format('D'),
                'credits' => Money::format($dayTx->where('transaction_type', 'Credit')->sum('amount')),
                'debits' => Money::format($dayTx->where('transaction_type', 'Debit')->sum('amount')),
                'count' => $dayTx->count(),
            ];
        })->values();

        $checkingBalance = (float) $accounts->where('type', 'Checking')->sum('balance');
        $savingsBalance = (float) $accounts->where('type', 'Savings')->sum('balance');

        return Inertia::render('dashboard', [
            'accounts' => $accounts->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'account_number' => $account->account_number,
                'balance' => Money::format($account->balance),
                'currency' => $account->currency,
                'share' => $totalBalance > 0
                    ? round(((float) $account->balance / $totalBalance) * 100, 1)
                    : 0,
            ]),
            'stats' => [
                'totalBalance' => Money::format($totalBalance),
                'accountCount' => $accounts->count(),
                'moneyIn' => Money::format($moneyIn),
                'moneyOut' => Money::format($moneyOut),
                'netFlow' => Money::format($moneyIn - $moneyOut),
                'checkingBalance' => Money::format($checkingBalance),
                'savingsBalance' => Money::format($savingsBalance),
                'transactionCount30d' => $periodTransactions->count(),
            ],
            'recentTransactions' => $recentTransactions,
            'activityByDay' => $activityByDay,
            'userName' => $user->name,
        ]);
    }
}
