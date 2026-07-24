<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Concerns\PasswordValidationRules;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Banking\ExchangeRateService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use PasswordValidationRules;

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'countries' => collect(config('countries'))->map(fn (string $currency, string $country) => [
                'country' => $country,
                'currency' => $currency,
            ])->values(),
        ]);
    }

    public function storeCustomer(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'tax_id' => ['required', 'string', 'min:4', 'max:32'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30'],
            'street_address' => ['required', 'string', 'max:255'],
            'address_line_two' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100', Rule::in(array_keys(config('countries')))],
            'password' => $this->passwordRules(),
        ]);

        $customer = DB::transaction(function () use ($data): User {
            $customer = new User($data);
            $customer->name = collect([$data['first_name'], $data['middle_name'] ?? null, $data['last_name']])->filter()->join(' ');
            $customer->forceFill(['email_verified_at' => now(), 'is_admin' => false])->save();

            Account::query()->create([
                'user_id' => $customer->id,
                'name' => 'Everyday Checking',
                'account_number' => 'CUST'.str_pad((string) $customer->id, 8, '0', STR_PAD_LEFT),
                'type' => 'Checking',
                'currency' => config('countries.'.$data['country']),
                'balance' => 0,
            ]);

            return $customer;
        });

        return to_route('admin.users.show', $customer)->with('success', 'Customer application approved and account opened.');
    }

    public function storeTestUsers(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name_prefix' => ['required', 'string', 'max:100'],
            'email_prefix' => ['required', 'regex:/^[a-z0-9][a-z0-9._-]{0,50}$/i'],
            'email_domain' => ['required', 'regex:/^[a-z0-9.-]+$/i', 'max:100'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'count' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $users = collect(range(1, $data['count']))->map(fn (int $number) => [
            'name' => $data['count'] === 1 ? $data['name_prefix'] : $data['name_prefix'].' '.$number,
            'email' => $data['email_prefix'].'-'.$number.'@'.$data['email_domain'],
        ]);

        if ($users->contains(fn (array $user) => ! filter_var($user['email'], FILTER_VALIDATE_EMAIL))) {
            throw ValidationException::withMessages(['email_domain' => 'Enter a valid email domain.']);
        }

        $existingEmail = User::query()->whereIn('email', $users->pluck('email'))->value('email');

        if ($existingEmail) {
            throw ValidationException::withMessages(['email_prefix' => "The generated email {$existingEmail} is already in use. Choose another prefix."]);
        }

        DB::transaction(function () use ($users, $data): void {
            $users->each(function (array $attributes) use ($data): void {
                $user = new User([
                    ...$attributes,
                    'password' => $data['password'],
                ]);
                $user->forceFill(['email_verified_at' => now(), 'is_admin' => false])->save();
                Account::query()->create([
                    'user_id' => $user->id,
                    'name' => 'Everyday Checking',
                    'account_number' => str_pad((string) $user->id, 12, '0', STR_PAD_LEFT),
                    'type' => 'Checking',
                    'currency' => 'USD',
                    'balance' => 0,
                ]);
            });
        });

        return to_route('admin.users.index')->with('success', "Created {$data['count']} test user(s).");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Administrator profiles cannot be changed from the customer directory.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => array_merge(['nullable'], array_slice($this->passwordRules(), 1)),
        ]);

        $user->fill(collect($data)->only(['name', 'email', 'phone', 'password'])->filter(fn ($value, $key) => $key !== 'password' || filled($value))->all());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Customer details updated.');
    }

    public function updateAccountBalance(Request $request, User $user, Account $account): RedirectResponse
    {
        if ($user->isAdmin() || $account->user_id !== $user->id) {
            abort(404);
        }

        $data = $request->validate(['balance' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/']]);

        DB::transaction(function () use ($account, $data): void {
            $account = Account::query()->lockForUpdate()->findOrFail($account->id);
            $currentBalance = Money::toCents($account->balance);
            $newBalance = Money::toCents($data['balance']);

            if ($currentBalance === $newBalance) {
                return;
            }

            $account->update(['balance' => Money::fromCents($newBalance)]);
            Transaction::query()->create([
                'account_id' => $account->id,
                'transaction_type' => $newBalance > $currentBalance ? 'Credit' : 'Debit',
                'amount' => Money::fromCents(abs($newBalance - $currentBalance)),
                'description' => 'Admin balance adjustment',
            ]);
        });

        return back()->with('success', 'Account balance updated.');
    }

    public function convertCurrency(Request $request, User $user, ExchangeRateService $rates): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(404);
        }

        $data = $request->validate([
            'currency' => ['required', 'string', Rule::in(array_values(config('countries')))],
        ]);

        $sourceCurrencies = $user->accounts()->distinct()->pluck('currency');

        if ($sourceCurrencies->isEmpty()) {
            return back()->withErrors(['currency' => 'This customer has no accounts to convert.']);
        }

        if ($sourceCurrencies->count() !== 1) {
            return back()->withErrors(['currency' => 'Currency conversion requires all customer accounts to currently use the same currency.']);
        }

        $sourceCurrency = (string) $sourceCurrencies->first();
        $targetCurrency = (string) $data['currency'];

        if ($sourceCurrency === $targetCurrency) {
            return back()->with('success', "Customer accounts already use {$targetCurrency}.");
        }

        try {
            $quote = $rates->quote($sourceCurrency, $targetCurrency, '1.00');
        } catch (\RuntimeException) {
            return back()->withErrors(['currency' => 'The exchange rate is temporarily unavailable. No balances were changed.']);
        }

        $rate = $quote['rate'];

        DB::transaction(function () use ($request, $user, $sourceCurrency, $targetCurrency, $rate, $quote): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $accounts = $lockedUser->accounts()->orderBy('id')->lockForUpdate()->get();

            if ($accounts->pluck('currency')->unique()->values()->all() !== [$sourceCurrency]) {
                throw ValidationException::withMessages(['currency' => 'Account currencies changed while conversion was being prepared. No balances were changed.']);
            }

            $accountIds = $accounts->pluck('id');
            $convert = fn (mixed $amount): string => number_format(round(((float) $amount) * $rate, 2), 2, '.', '');

            foreach ($accounts as $account) {
                $account->update([
                    'balance' => $convert($account->balance),
                    'currency' => $targetCurrency,
                ]);
            }

            Transaction::query()->whereIn('account_id', $accountIds)->get()
                ->each(fn (Transaction $transaction) => $transaction->update(['amount' => $convert($transaction->amount)]));

            $lockedUser->transfers()->get()->each(fn ($transfer) => $transfer->update([
                'amount' => $convert($transfer->amount),
                'fee_amount' => $convert($transfer->fee_amount),
                'currency' => $targetCurrency,
            ]));

            $lockedUser->bills()->get()->each(fn ($bill) => $bill->update(['amount' => $convert($bill->amount)]));
            $lockedUser->budgets()->get()->each(fn ($budget) => $budget->update([
                'limit' => $convert($budget->limit),
                'spent' => $convert($budget->spent),
            ]));
            $lockedUser->savingsGoals()->get()->each(fn ($goal) => $goal->update([
                'target_amount' => $convert($goal->target_amount),
                'current_amount' => $convert($goal->current_amount),
            ]));
            $lockedUser->recurringTransfers()->get()->each(fn ($transfer) => $transfer->update(['amount' => $convert($transfer->amount)]));

            Log::notice('Admin converted customer currency', [
                'admin_user_id' => $request->user()->id,
                'customer_user_id' => $lockedUser->id,
                'from_currency' => $sourceCurrency,
                'to_currency' => $targetCurrency,
                'exchange_rate' => $rate,
                'rate_date' => $quote['date'],
                'account_ids' => $accountIds->all(),
            ]);
        }, attempts: 3);

        return back()->with('success', "Customer finances converted from {$sourceCurrency} to {$targetCurrency} at {$rate}.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Administrator accounts cannot be deleted from the user directory.');
        }

        $user->delete();

        return to_route('admin.users.index')->with('success', 'Test user deleted.');
    }

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
                'phone' => $user->phone,
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
                'phone' => $user->phone,
                'is_admin' => $user->is_admin,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'accounts_count' => $accounts->count(),
                'total_balance' => Money::format($accounts->sum('balance')),
                'account_currency' => $accounts->pluck('currency')->unique()->count() === 1
                    ? $accounts->first()?->currency
                    : null,
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
            'currencies' => collect(config('countries'))->values()->unique()->sort()->values(),
        ]);
    }
}
