<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->withCount('accounts')
            ->withSum('accounts', 'balance')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'accounts_count' => $user->accounts_count,
                'total_balance' => Money::format($user->accounts_sum_balance ?? 0),
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
            'summary' => [
                'total' => User::query()->count(),
                'admins' => User::query()->where('is_admin', true)->count(),
                'customers' => User::query()->where('is_admin', false)->count(),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['accounts' => fn ($q) => $q->orderByDesc('balance')]);

        $accounts = $user->accounts;
        $accountIds = $accounts->pluck('id');

        $transactions = \App\Models\Transaction::query()
            ->with('account:id,name,currency')
            ->whereIn('account_id', $accountIds)
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($transaction) => [
                'id' => $transaction->id,
                'transaction_type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => Money::format($transaction->amount),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'account_name' => $transaction->account?->name ?? '—',
                'currency' => $transaction->account?->currency ?? 'USD',
            ]);

        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'accounts_count' => $accounts->count(),
                'total_balance' => Money::format($accounts->sum('balance')),
            ],
            'accounts' => $accounts->map(fn ($account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'account_number' => $account->account_number,
                'balance' => Money::format($account->balance),
                'currency' => $account->currency,
                'created_at' => $account->created_at?->toIso8601String(),
            ]),
            'transactions' => $transactions,
        ]);
    }
}
