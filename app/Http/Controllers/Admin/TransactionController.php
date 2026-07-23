<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
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
            'customers' => User::query()->where('is_admin', false)->withCount('accounts')->orderBy('name')->get()->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'accounts_count' => $user->accounts_count,
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
            'user_ids' => ['required', 'array', 'min:1', 'max:100'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'transaction_type' => ['required', 'in:Credit,Debit'],
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'amount' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        DB::transaction(function () use ($data): void {
            $selectedUserIds = array_values(array_unique($data['user_ids']));
            $customerIds = User::query()->whereIn('id', $selectedUserIds)->where('is_admin', false)->pluck('id')->all();

            if (count($customerIds) !== count($selectedUserIds)) {
                throw ValidationException::withMessages(['user_ids' => 'Only customer accounts can receive generated transactions.']);
            }

            $usersWithAccounts = Account::query()->whereIn('user_id', $customerIds)->distinct()->pluck('user_id')->all();

            foreach (array_diff($customerIds, $usersWithAccounts) as $userId) {
                Account::query()->firstOrCreate(
                    ['user_id' => $userId, 'name' => 'Everyday Checking'],
                    [
                        'account_number' => 'TEST'.str_pad((string) $userId, 8, '0', STR_PAD_LEFT),
                        'type' => 'Checking',
                        'currency' => 'USD',
                        'balance' => 0,
                    ],
                );
            }

            $accounts = Account::query()->whereIn('user_id', $customerIds)->orderBy('id')->lockForUpdate()->get();

            $amount = Money::toCents($data['amount']);
            $total = $amount * $data['count'];

            if ($data['transaction_type'] === 'Debit' && $accounts->contains(fn (Account $account) => $total > Money::toCents($account->balance))) {
                throw ValidationException::withMessages(['amount' => 'The generated debits exceed the account balance.']);
            }

            $start = Carbon::parse($data['start_date'])->startOfDay();
            $end = Carbon::parse($data['end_date'])->endOfDay();
            $seconds = $start->diffInSeconds($end);

            $descriptionIndex = 0;

            foreach ($accounts as $account) {
                $balance = Money::toCents($account->balance);

                for ($index = 0; $index < $data['count']; $index++) {
                    $slotStart = intdiv($seconds * $index, $data['count']);
                    $slotEnd = intdiv($seconds * ($index + 1), $data['count']);
                    $at = $start->copy()->addSeconds(random_int($slotStart, max($slotStart, $slotEnd - 1)));
                    $transaction = new Transaction([
                        'account_id' => $account->id,
                        'transaction_type' => $data['transaction_type'],
                        'amount' => Money::fromCents($amount),
                        'description' => self::GENERATED_PAYMENT_DESCRIPTIONS[$descriptionIndex % count(self::GENERATED_PAYMENT_DESCRIPTIONS)],
                    ]);
                    $transaction->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
                    $descriptionIndex++;
                }

                $account->update(['balance' => Money::fromCents($data['transaction_type'] === 'Credit' ? $balance + $total : $balance - $total)]);
            }
        });

        return back();
    }
}
