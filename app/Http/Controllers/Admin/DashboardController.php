<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subDays(7);
        $monthAgo = $now->copy()->subDays(30);

        $userCount = User::query()->count();
        $adminCount = User::query()->where('is_admin', true)->count();
        $accountCount = Account::query()->count();
        $transactionCount = Transaction::query()->count();
        $totalDeposits = (float) Account::query()->sum('balance');

        $newUsersWeek = User::query()->where('created_at', '>=', $weekAgo)->count();
        $newAccountsWeek = Account::query()->where('created_at', '>=', $weekAgo)->count();
        $transactionsWeek = Transaction::query()->where('created_at', '>=', $weekAgo)->count();

        $volumeWeek = Transaction::query()
            ->where('created_at', '>=', $weekAgo)
            ->sum('amount');

        $creditsMonth = (float) Transaction::query()
            ->where('transaction_type', 'Credit')
            ->where('created_at', '>=', $monthAgo)
            ->sum('amount');

        $debitsMonth = (float) Transaction::query()
            ->where('transaction_type', 'Debit')
            ->where('created_at', '>=', $monthAgo)
            ->sum('amount');

        $recentUsers = User::query()
            ->withCount('accounts')
            ->withSum('accounts', 'balance')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'accounts_count' => $user->accounts_count,
                'total_balance' => Money::format($user->accounts_sum_balance ?? 0),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        $recentTransactions = Transaction::query()
            ->with(['account:id,name,user_id,currency', 'account.user:id,name,email'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'transaction_type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => Money::format($transaction->amount),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'account_name' => $transaction->account?->name ?? '—',
                'user_name' => $transaction->account?->user?->name ?? '—',
                'currency' => $transaction->account?->currency ?? 'USD',
            ]);

        $topAccounts = Account::query()
            ->with('user:id,name,email')
            ->orderByDesc('balance')
            ->limit(5)
            ->get()
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => Money::format($account->balance),
                'currency' => $account->currency,
                'account_number' => $account->account_number,
                'user_name' => $account->user?->name ?? '—',
                'user_email' => $account->user?->email ?? '—',
            ]);

        $accountsByType = [
            'Checking' => Account::query()->where('type', 'Checking')->count(),
            'Savings' => Account::query()->where('type', 'Savings')->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'userCount' => $userCount,
                'adminCount' => $adminCount,
                'accountCount' => $accountCount,
                'transactionCount' => $transactionCount,
                'totalDeposits' => Money::format($totalDeposits),
                'newUsersWeek' => $newUsersWeek,
                'newAccountsWeek' => $newAccountsWeek,
                'transactionsWeek' => $transactionsWeek,
                'volumeWeek' => Money::format((float) $volumeWeek),
                'creditsMonth' => Money::format($creditsMonth),
                'debitsMonth' => Money::format($debitsMonth),
            ],
            'recentUsers' => $recentUsers,
            'recentTransactions' => $recentTransactions,
            'topAccounts' => $topAccounts,
            'accountsByType' => $accountsByType,
        ]);
    }
}
