<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)->get();
        $totalBalance = $accounts->sum('balance');

        return Inertia::render('dashboard', [
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
}
