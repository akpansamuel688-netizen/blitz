<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    private const GENERATED_PAYMENT_DESCRIPTIONS = [
        'Entertainment',
        'Food',
        'Charity',
        'Family support',
        'Business',
        'Vacation',
        'Hotel payment',
        'Monthly rent',
    ];

    public function index(): Response
    {
        return Inertia::render('admin/transactions', [
            'accounts' => Account::query()->with('user:id,name')->orderBy('name')->get()->map(fn (Account $account) => [
                'id' => $account->id, 'name' => $account->name, 'balance' => Money::format($account->balance),
                'currency' => $account->currency, 'user_name' => $account->user?->name ?? 'User',
            ]),
            'transactions' => Transaction::query()->with('account:id,name,user_id')->latest()->limit(100)->get()->map(fn (Transaction $transaction) => [
                'id' => $transaction->id, 'type' => $transaction->transaction_type, 'amount' => Money::format($transaction->amount),
                'description' => $transaction->description, 'account_name' => $transaction->account?->name ?? 'Account',
                'created_at' => $transaction->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validate(['description' => ['nullable', 'string', 'max:255']]);
        $transaction->update($data);

        return back();
    }

    public function generate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'account_id' => ['required', 'exists:accounts,id'],
            'transaction_type' => ['required', 'in:Credit,Debit'],
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'amount' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        DB::transaction(function () use ($data): void {
            $account = Account::query()->lockForUpdate()->findOrFail($data['account_id']);
            $amount = Money::toCents($data['amount']);
            $total = $amount * $data['count'];
            $balance = Money::toCents($account->balance);

            if ($data['transaction_type'] === 'Debit' && $total > $balance) {
                throw ValidationException::withMessages(['amount' => 'The generated debits exceed the account balance.']);
            }

            $start = Carbon::parse($data['start_date'])->startOfDay();
            $end = Carbon::parse($data['end_date'])->endOfDay();
            $seconds = $start->diffInSeconds($end);

            for ($index = 0; $index < $data['count']; $index++) {
                $slotStart = intdiv($seconds * $index, $data['count']);
                $slotEnd = intdiv($seconds * ($index + 1), $data['count']);
                $at = $start->copy()->addSeconds(random_int($slotStart, max($slotStart, $slotEnd - 1)));
                $transaction = new Transaction([
                    'account_id' => $account->id,
                    'transaction_type' => $data['transaction_type'],
                    'amount' => Money::fromCents($amount),
                    'description' => self::GENERATED_PAYMENT_DESCRIPTIONS[$index % count(self::GENERATED_PAYMENT_DESCRIPTIONS)],
                ]);
                $transaction->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
            }

            $account->update(['balance' => Money::fromCents($data['transaction_type'] === 'Credit' ? $balance + $total : $balance - $total)]);
        });

        return back();
    }
}
