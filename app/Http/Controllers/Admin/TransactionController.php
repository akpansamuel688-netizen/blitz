<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\TransactionEditAudit;
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
    public const STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'];
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
                'status' => $transaction->status,
                'created_at' => $transaction->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['account.user:id,name,email', 'editAudits.admin:id,name']);

        return Inertia::render('admin/transactions/show', [
            'transaction' => [
                'id' => $transaction->id,
                'customer_name' => $transaction->account?->user?->name ?? 'Customer',
                'account_name' => $transaction->account?->name ?? 'Account',
                'currency' => $transaction->account?->currency ?? 'USD',
                'type' => $transaction->transaction_type,
                'description' => $transaction->description,
                'amount' => number_format((float) $transaction->amount, 2, '.', ''),
                'status' => $transaction->status,
                'created_at' => $transaction->created_at?->toIso8601String(),
                'is_transfer_linked' => $transaction->transfer_id !== null,
            ],
            'statuses' => self::STATUSES,
            'audits' => $transaction->editAudits->sortByDesc('created_at')->values()->map(fn (TransactionEditAudit $audit) => [
                'id' => $audit->id,
                'admin_name' => $audit->admin?->name ?? 'Administrator',
                'previous_values' => $audit->previous_values,
                'new_values' => $audit->new_values,
                'reason' => $audit->reason,
                'created_at' => $audit->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validate(['description' => ['nullable', 'string', 'max:255']]);
        $transaction->update($data);

        return back();
    }

    public function updateFinancial(Request $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'amount' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/'],
            'status' => ['required', 'in:'.implode(',', self::STATUSES)],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $newTimestamp = Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['time']);
        $newAmount = Money::toCents($data['amount']);

        if ($newAmount <= 0) {
            throw ValidationException::withMessages(['amount' => 'The amount must be greater than zero.']);
        }

        DB::transaction(function () use ($transaction, $request, $data, $newTimestamp, $newAmount): void {
            $lockedTransaction = Transaction::query()->lockForUpdate()->findOrFail($transaction->id);
            $account = Account::query()->lockForUpdate()->findOrFail($lockedTransaction->account_id);
            $oldAmount = Money::toCents($lockedTransaction->amount);
            $oldStatus = $lockedTransaction->status;

            if ($lockedTransaction->transfer_id && ($oldAmount !== $newAmount || $oldStatus !== $data['status'])) {
                throw ValidationException::withMessages(['amount' => 'Transfer-linked amounts and statuses are managed by the transfer ledger and cannot be edited independently.']);
            }

            $oldEffect = $this->balanceEffect($lockedTransaction->transaction_type, $oldAmount, $oldStatus);
            $newEffect = $this->balanceEffect($lockedTransaction->transaction_type, $newAmount, $data['status']);
            $newBalance = Money::toCents($account->balance) + ($newEffect - $oldEffect);

            if ($newBalance < 0) {
                throw ValidationException::withMessages(['amount' => 'This change would make the account balance negative.']);
            }

            $previousValues = [
                'date_time' => $lockedTransaction->created_at?->toIso8601String(),
                'amount' => Money::fromCents($oldAmount),
                'status' => $oldStatus,
            ];
            $newValues = [
                'date_time' => $newTimestamp->toIso8601String(),
                'amount' => Money::fromCents($newAmount),
                'status' => $data['status'],
            ];

            $lockedTransaction->forceFill([
                'amount' => Money::fromCents($newAmount),
                'status' => $data['status'],
                'created_at' => $newTimestamp,
            ])->save();

            if ($newEffect !== $oldEffect) {
                $account->update(['balance' => Money::fromCents($newBalance)]);
            }

            TransactionEditAudit::query()->create([
                'transaction_id' => $lockedTransaction->id,
                'admin_user_id' => $request->user()->id,
                'previous_values' => $previousValues,
                'new_values' => $newValues,
                'reason' => $data['reason'],
            ]);
        });

        return to_route('admin.transactions.show', $transaction)->with('success', 'Transaction updated and audit record saved.');
    }

    private function balanceEffect(string $type, int $amount, string $status): int
    {
        if ($status !== 'completed') {
            return 0;
        }

        return match ($type) {
            'Credit' => $amount,
            'Debit' => -$amount,
            default => throw ValidationException::withMessages(['amount' => 'Only Credit and Debit transactions can be financially edited.']),
        };
    }

    public function generate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1', 'max:100'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'transaction_type' => ['required', 'in:Credit,Debit'],
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'amount' => ['nullable', 'regex:/^\d{1,16}(\.\d{1,2})?$/', 'required_without_all:min_amount,max_amount'],
            'min_amount' => ['nullable', 'regex:/^\d{1,16}(\.\d{1,2})?$/', 'required_with:max_amount'],
            'max_amount' => ['nullable', 'regex:/^\d{1,16}(\.\d{1,2})?$/', 'required_with:min_amount'],
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

            [$minimumAmount, $maximumAmount] = $this->generatedAmountRange($data);

            $start = Carbon::parse($data['start_date'])->startOfDay();
            $end = Carbon::parse($data['end_date'])->endOfDay();
            $seconds = $start->diffInSeconds($end);

            $descriptionIndex = 0;

            foreach ($accounts as $account) {
                $balance = Money::toCents($account->balance);
                $amounts = $this->randomAmounts($minimumAmount, $maximumAmount, $data['count']);
                $total = array_sum($amounts);

                if ($data['transaction_type'] === 'Debit' && $total > $balance) {
                    throw ValidationException::withMessages(['min_amount' => 'The generated debits exceed the account balance.']);
                }

                foreach ($amounts as $index => $amount) {
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

    /** @return array{int, int} */
    private function generatedAmountRange(array $data): array
    {
        if (isset($data['min_amount'], $data['max_amount'])) {
            $minimum = Money::toCents($data['min_amount']);
            $maximum = Money::toCents($data['max_amount']);

            if ($minimum < 100 || $maximum > 10_000_000) {
                throw ValidationException::withMessages(['min_amount' => 'Each transaction amount must be between $1.00 and $100,000.00.']);
            }

            if ($minimum > $maximum) {
                throw ValidationException::withMessages(['max_amount' => 'Maximum amount must be greater than or equal to minimum amount.']);
            }

            if ($data['count'] > 1 && $minimum === $maximum) {
                throw ValidationException::withMessages(['max_amount' => 'Choose a range so each generated transaction can have a different amount.']);
            }

            return [$minimum, $maximum];
        }

        $maximum = Money::toCents($data['amount']);
        if ($maximum < 100 || $maximum > 10_000_000) {
            throw ValidationException::withMessages(['amount' => 'Each transaction amount must be between $1.00 and $100,000.00.']);
        }

        return [100, $maximum];
    }

    /** @return list<int> */
    private function randomAmounts(int $minimum, int $maximum, int $count): array
    {
        if ($minimum === $maximum) {
            return array_fill(0, $count, $minimum);
        }

        if (($maximum - $minimum + 1) < $count) {
            throw ValidationException::withMessages(['max_amount' => 'Choose a wider amount range to create a different amount for every transaction.']);
        }

        $amounts = [];
        while (count($amounts) < $count) {
            $amount = random_int($minimum, $maximum);
            if (! in_array($amount, $amounts, true)) {
                $amounts[] = $amount;
            }
        }

        return $amounts;
    }
}
