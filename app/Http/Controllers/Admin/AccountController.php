<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $type = trim((string) $request->query('type', ''));

        $accounts = Account::query()
            ->with('user:id,name,email')
            ->withCount('transactions')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($type, ['Checking', 'Savings'], true), fn ($q) => $q->where('type', $type))
            ->orderByDesc('balance')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'account_number' => $account->account_number,
                'balance' => Money::format($account->balance),
                'currency' => $account->currency,
                'transactions_count' => $account->transactions_count,
                'user' => [
                    'id' => $account->user?->id,
                    'name' => $account->user?->name ?? '—',
                    'email' => $account->user?->email ?? '—',
                ],
                'created_at' => $account->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/accounts/index', [
            'accounts' => $accounts,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
            'summary' => [
                'total' => Account::query()->count(),
                'checking' => Account::query()->where('type', 'Checking')->count(),
                'savings' => Account::query()->where('type', 'Savings')->count(),
                'totalBalance' => Money::format((float) Account::query()->sum('balance')),
            ],
        ]);
    }
}
