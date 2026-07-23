<?php

namespace Tests\Feature\Admin;

use App\Models\Account;
use App\Models\DebitCard;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Support\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_admin_dashboard(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_non_admin_users_are_forbidden(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_sign_in_from_the_standalone_admin_login(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@example.com']);

        $this->post(route('admin.login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ])
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($admin);
    }

    public function test_customer_cannot_sign_in_to_the_admin_console(): void
    {
        $customer = User::factory()->create(['email' => 'customer@example.com']);

        $this->post(route('admin.login.store'), [
            'email' => $customer->email,
            'password' => 'password',
        ])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_admin_can_view_platform_console(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create(['balance' => 500]);
        Transaction::factory()->for($account)->create();

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/dashboard')
                ->has('stats')
                ->where('stats.userCount', 2)
                ->where('stats.accountCount', 1)
                ->has('recentUsers')
                ->has('recentTransactions')
                ->has('topAccounts')
            );
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users/index')
                ->has('users.data', 3)
                ->where('summary.total', 3)
            );
    }

    public function test_admin_can_create_multiple_test_users(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.test-users.store'), [
                'name_prefix' => 'QA User',
                'email_prefix' => 'qa-user',
                'email_domain' => 'example.test',
                'password' => 'test-password',
                'count' => 3,
            ])
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseCount('users', 4);
        $this->assertDatabaseHas('users', ['name' => 'QA User 1', 'email' => 'qa-user-1@example.test', 'is_admin' => false]);
        $this->assertDatabaseHas('users', ['name' => 'QA User 3', 'email' => 'qa-user-3@example.test', 'is_admin' => false]);
        $this->assertDatabaseCount('accounts', 3);
    }

    public function test_admin_can_create_a_customer_from_the_new_customer_application(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'first_name' => 'Morgan',
                'middle_name' => 'Lee',
                'last_name' => 'Customer',
                'date_of_birth' => '1990-05-12',
                'tax_id' => '123-45-6789',
                'email' => 'morgan.customer@example.test',
                'phone' => '+1 555 010 2000',
                'street_address' => '123 Banking Street',
                'address_line_two' => 'Suite 4',
                'city' => 'Austin',
                'state' => 'Texas',
                'postal_code' => '78701',
                'country' => 'United States',
                'password' => 'secure-customer-password',
                'password_confirmation' => 'secure-customer-password',
            ])
            ->assertRedirect();

        $customer = User::query()->where('email', 'morgan.customer@example.test')->firstOrFail();
        $this->assertSame('Morgan Lee Customer', $customer->name);
        $this->assertFalse($customer->isAdmin());
        $this->assertSame('123-45-6789', $customer->tax_id);
        $this->assertNotSame('123-45-6789', DB::table('users')->where('id', $customer->id)->value('tax_id'));
        $this->assertDatabaseHas('accounts', [
            'user_id' => $customer->id,
            'name' => 'Everyday Checking',
            'balance' => '0.00',
        ]);
    }

    public function test_admin_can_edit_a_test_user_name_and_account_balance(): void
    {
        $admin = User::factory()->admin()->create();
        $testUser = User::factory()->create(['name' => 'Before Name', 'is_admin' => false]);
        $account = Account::factory()->for($testUser)->create(['balance' => 100]);

        $this->actingAs($admin)
            ->patch(route('admin.users.update', $testUser), ['name' => 'After Name'])
            ->assertRedirect();

        $this->patch(route('admin.users.accounts.balance.update', [$testUser, $account]), ['balance' => '250.25'])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $testUser->id, 'name' => 'After Name']);
        $this->assertDatabaseHas('accounts', ['id' => $account->id, 'balance' => '250.25']);
        $this->assertDatabaseHas('transactions', [
            'account_id' => $account->id,
            'transaction_type' => 'Credit',
            'amount' => '150.25',
            'description' => 'Admin balance adjustment',
        ]);
    }

    public function test_admin_can_update_customer_email_phone_and_reset_password_without_exposing_it(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create([
            'email' => 'before@example.test',
            'phone' => '+1 555 010 0000',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.users.update', $customer), [
                'name' => 'Updated Customer',
                'email' => 'after@example.test',
                'phone' => '+1 555 010 9999',
                'password' => 'NewSecurePassword123!',
                'password_confirmation' => 'NewSecurePassword123!',
            ])
            ->assertRedirect();

        $customer->refresh();
        $this->assertSame('Updated Customer', $customer->name);
        $this->assertSame('after@example.test', $customer->email);
        $this->assertSame('+1 555 010 9999', $customer->phone);
        $this->assertNull($customer->email_verified_at);
        $this->assertTrue(Hash::check('NewSecurePassword123!', $customer->password));
        $this->assertNotSame('NewSecurePassword123!', $customer->password);
    }

    public function test_customer_cannot_update_another_customer_from_admin_routes(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();

        $this->actingAs($customer)
            ->patch(route('admin.users.update', $otherCustomer), ['name' => 'Attempted change'])
            ->assertRedirect(route('admin.login'));

        $this->assertNotSame('Attempted change', $otherCustomer->fresh()->name);
    }

    public function test_admin_can_delete_a_test_user_but_not_an_administrator(): void
    {
        $admin = User::factory()->admin()->create();
        $testUser = User::factory()->create(['is_admin' => false]);

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $testUser))
            ->assertRedirect(route('admin.users.index'));

        $this->assertModelMissing($testUser);

        $this->delete(route('admin.users.destroy', $admin))
            ->assertSessionHas('error');

        $this->assertModelExists($admin);
    }

    public function test_admin_can_view_user_detail(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create(['name' => 'Casey Customer']);
        Account::factory()->for($customer)->create();

        $this->actingAs($admin)
            ->get(route('admin.users.show', $customer))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users/show')
                ->where('user.name', 'Casey Customer')
                ->has('accounts', 1)
            );
    }

    public function test_admin_can_list_accounts(): void
    {
        $admin = User::factory()->admin()->create();
        Account::factory()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('admin.accounts.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/accounts/index')
                ->has('accounts.data', 2)
            );
    }

    public function test_admin_can_approve_or_reject_requested_physical_debit_cards(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create();
        $approvedCard = DebitCard::query()->create([
            'user_id' => $customer->id, 'account_id' => $account->id, 'card_type' => 'physical', 'status' => 'requested',
            'card_number_hash' => hash('sha256', '4000000000000002'), 'last_four' => '0002', 'expires_at' => now()->addYears(3),
        ]);
        $rejectedCard = DebitCard::query()->create([
            'user_id' => $customer->id, 'account_id' => $account->id, 'card_type' => 'physical', 'status' => 'requested',
            'card_number_hash' => hash('sha256', '4000000000000010'), 'last_four' => '0010', 'expires_at' => now()->addYears(3),
        ]);

        $this->actingAs($admin)->get(route('admin.cards.index'))->assertOk()->assertInertia(fn ($page) => $page->component('admin/cards/index')->has('requests', 2));
        $this->patch(route('admin.cards.approve', $approvedCard))->assertRedirect();
        $this->patch(route('admin.cards.reject', $rejectedCard))->assertRedirect();

        $approvedCard->refresh();
        $this->assertSame('active', $approvedCard->status);
        $this->assertNotNull($approvedCard->card_number);
        $this->assertNotNull($approvedCard->cvv);
        $this->assertDatabaseHas('debit_cards', ['id' => $rejectedCard->id, 'status' => 'rejected']);
    }

    public function test_customers_cannot_approve_physical_card_requests(): void
    {
        $customer = User::factory()->create();
        $card = DebitCard::query()->create([
            'user_id' => $customer->id, 'account_id' => Account::factory()->for($customer)->create()->id,
            'card_type' => 'physical', 'status' => 'requested', 'card_number_hash' => hash('sha256', '4000000000000002'),
            'last_four' => '0002', 'expires_at' => now()->addYears(3),
        ]);

        $this->actingAs($customer)->patch(route('admin.cards.approve', $card))->assertRedirect(route('admin.login'));
        $this->assertDatabaseHas('debit_cards', ['id' => $card->id, 'status' => 'requested']);
    }

    public function test_admin_can_view_transfer_ledger(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.transfers.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/transfers')
                ->has('transfers.data')
                ->has('filters')
            );
    }

    public function test_admin_generates_described_credit_transactions(): void
    {
        $admin = User::factory()->admin()->create();
        $account = Account::factory()->create(['balance' => 500]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.generate'), [
                'user_ids' => [$account->user_id],
                'transaction_type' => 'Credit',
                'count' => 3,
                'amount' => '25.50',
                'start_date' => '2026-07-01',
                'end_date' => '2026-07-03',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('transactions', 3);
        $this->assertDatabaseHas('transactions', [
            'account_id' => $account->id,
            'transaction_type' => 'Credit',
            'description' => 'Entertainment',
        ]);
        $this->assertDatabaseHas('transactions', ['description' => 'Food']);
        $this->assertDatabaseHas('transactions', ['description' => 'Charity']);
        $generatedTransactions = Transaction::query()->orderBy('created_at')->get();
        $this->assertCount(3, $generatedTransactions->map(fn (Transaction $transaction) => $transaction->created_at->getTimestamp())->unique()->all());

        foreach ($generatedTransactions as $transaction) {
            $this->assertTrue($transaction->created_at->gte('2026-07-01 00:00:00'));
            $this->assertTrue($transaction->created_at->lte('2026-07-03 23:59:59'));
        }

        $amounts = $generatedTransactions->map(fn (Transaction $transaction) => Money::toCents($transaction->amount));
        $this->assertCount(3, $amounts->unique());
        $this->assertTrue($amounts->every(fn (int $amount) => $amount >= 100 && $amount <= 2_550));
        $this->assertSame(Money::fromCents(50_000 + $amounts->sum()), (string) $account->fresh()->balance);
    }

    public function test_admin_can_generate_transactions_for_multiple_customers(): void
    {
        $admin = User::factory()->admin()->create();
        $firstAccount = Account::factory()->create(['balance' => 500]);
        $secondAccount = Account::factory()->create(['balance' => 200]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.generate'), [
                'user_ids' => [$firstAccount->user_id, $secondAccount->user_id],
                'transaction_type' => 'Credit',
                'count' => 2,
                'amount' => '20.00',
                'start_date' => '2026-07-01',
                'end_date' => '2026-07-02',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('transactions', 4);
        $firstAmounts = Transaction::query()->where('account_id', $firstAccount->id)->get()->map(fn (Transaction $transaction) => Money::toCents($transaction->amount));
        $secondAmounts = Transaction::query()->where('account_id', $secondAccount->id)->get()->map(fn (Transaction $transaction) => Money::toCents($transaction->amount));
        $this->assertCount(2, $firstAmounts->unique());
        $this->assertCount(2, $secondAmounts->unique());
        $this->assertSame(Money::fromCents(50_000 + $firstAmounts->sum()), (string) $firstAccount->fresh()->balance);
        $this->assertSame(Money::fromCents(20_000 + $secondAmounts->sum()), (string) $secondAccount->fresh()->balance);
    }

    public function test_admin_generates_a_different_amount_for_each_transaction_in_the_selected_range(): void
    {
        $admin = User::factory()->admin()->create();
        $account = Account::factory()->create(['balance' => 0]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.generate'), [
                'user_ids' => [$account->user_id],
                'transaction_type' => 'Credit',
                'count' => 5,
                'min_amount' => '1.00',
                'max_amount' => '100000.00',
                'start_date' => '2026-07-01',
                'end_date' => '2026-07-05',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $transactions = Transaction::query()->where('account_id', $account->id)->get();
        $amounts = $transactions->map(fn (Transaction $transaction) => Money::toCents($transaction->amount));

        $this->assertCount(5, $transactions);
        $this->assertCount(5, $amounts->unique());
        $this->assertTrue($amounts->every(fn (int $amount) => $amount >= 100 && $amount <= 10_000_000));
        $this->assertSame(Money::fromCents($amounts->sum()), (string) $account->fresh()->balance);
    }

    public function test_admin_can_generate_transactions_for_a_customer_without_an_account(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create(['is_admin' => false]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.generate'), [
                'user_ids' => [$customer->id],
                'transaction_type' => 'Credit',
                'count' => 1,
                'amount' => '50.00',
                'start_date' => '2026-07-01',
                'end_date' => '2026-07-01',
            ])
            ->assertRedirect();

        $account = Account::query()->where('user_id', $customer->id)->firstOrFail();
        $transaction = Transaction::query()->where('account_id', $account->id)->sole();
        $this->assertTrue(Money::toCents($transaction->amount) >= 100 && Money::toCents($transaction->amount) <= 5_000);
        $this->assertSame((string) $transaction->amount, (string) $account->balance);
    }

    public function test_admin_can_delete_a_ledger_transaction_and_reconcile_the_customer_balance(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create(['balance' => 150]);
        $transaction = Transaction::factory()->for($account)->create([
            'transaction_type' => 'Credit',
            'amount' => 50,
            'description' => 'Duplicate credit',
            'status' => 'completed',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.transactions.destroy', $transaction))
            ->assertRedirect();

        $this->assertModelMissing($transaction);
        $this->assertSame('100.00', (string) $account->fresh()->balance);

        $this->actingAs($customer)
            ->get(route('transactions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('transactions', []));
    }

    public function test_admin_can_edit_transaction_date_time_amount_and_status_with_an_audit_record(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'John Admin']);
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create(['balance' => 100]);
        $transaction = Transaction::factory()->for($account)->create([
            'transaction_type' => 'Credit',
            'status' => 'completed',
            'amount' => 100,
            'created_at' => '2026-07-01 09:30:00',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.transactions.financial.update', $transaction), [
                'date' => '2026-07-04',
                'time' => '14:45',
                'amount' => '150.00',
                'status' => 'completed',
                'reason' => 'Corrected the deposit amount.',
            ])
            ->assertRedirect(route('admin.transactions.show', $transaction));

        $transaction->refresh();
        $this->assertSame('150.00', (string) $transaction->amount);
        $this->assertSame('completed', $transaction->status);
        $this->assertSame('2026-07-04 14:45', $transaction->created_at->format('Y-m-d H:i'));
        $this->assertSame('150.00', (string) $account->fresh()->balance);
        $this->assertDatabaseHas('transaction_edit_audits', [
            'transaction_id' => $transaction->id,
            'admin_user_id' => $admin->id,
            'reason' => 'Corrected the deposit amount.',
        ]);
    }

    public function test_status_change_reconciles_balance_and_normal_users_cannot_edit_transactions(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create(['balance' => 80]);
        $transaction = Transaction::factory()->for($account)->create(['transaction_type' => 'Credit', 'status' => 'completed', 'amount' => 80]);

        $this->actingAs($customer)
            ->patch(route('admin.transactions.financial.update', $transaction), [
                'date' => '2026-07-01', 'time' => '10:00', 'amount' => '80.00', 'status' => 'pending', 'reason' => 'Should be rejected.',
            ])
            ->assertRedirect(route('admin.login'));

        $this->actingAs($admin)
            ->patch(route('admin.transactions.financial.update', $transaction), [
                'date' => '2026-07-01', 'time' => '10:00', 'amount' => '80.00', 'status' => 'pending', 'reason' => 'Deposit is awaiting settlement.',
            ])
            ->assertRedirect();

        $this->assertSame('pending', $transaction->fresh()->status);
        $this->assertSame('0.00', (string) $account->fresh()->balance);
    }

    public function test_invalid_financial_edit_rolls_back_and_customer_history_uses_updated_values(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $account = Account::factory()->for($customer)->create(['balance' => 50]);
        $transaction = Transaction::factory()->for($account)->create(['transaction_type' => 'Debit', 'status' => 'completed', 'amount' => 50]);

        $this->actingAs($admin)
            ->patch(route('admin.transactions.financial.update', $transaction), [
                'date' => '2026-07-02', 'time' => '09:00', 'amount' => '200.00', 'status' => 'completed', 'reason' => 'This should not be applied.',
            ])
            ->assertSessionHasErrors('amount');

        $this->assertSame('50.00', (string) $transaction->fresh()->amount);
        $this->assertSame('50.00', (string) $account->fresh()->balance);
        $this->assertDatabaseCount('transaction_edit_audits', 0);

        $this->actingAs($admin)
            ->patch(route('admin.transactions.financial.update', $transaction), [
                'date' => '2026-07-03', 'time' => '11:15', 'amount' => '40.00', 'status' => 'completed', 'reason' => 'Corrected debit amount.',
            ])
            ->assertRedirect();

        $this->actingAs($customer)
            ->get(route('transactions.show', $transaction))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('transaction.amount', '40.00')
                ->where('transaction.status', 'completed')
            );
    }

    public function test_admin_can_edit_a_customer_transfer_amount_and_description_safely(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $source = Account::factory()->for($customer)->create(['name' => 'Source', 'balance' => '899.20']);
        $destination = Account::factory()->for($customer)->create(['name' => 'Destination', 'balance' => '100.00']);
        $transfer = Transfer::query()->create([
            'user_id' => $customer->id,
            'source_account_id' => $source->id,
            'destination_account_id' => $destination->id,
            'transfer_type' => 'internal',
            'status' => 'completed',
            'amount' => '100.00',
            'fee_amount' => '0.80',
            'currency' => 'USD',
            'description' => 'Original transfer',
        ]);
        $sourceTransaction = Transaction::factory()->for($source)->create(['transfer_id' => $transfer->id, 'transaction_type' => 'Debit', 'amount' => '100.80']);
        $destinationTransaction = Transaction::factory()->for($destination)->create(['transfer_id' => $transfer->id, 'transaction_type' => 'Credit', 'amount' => '100.00']);

        $this->actingAs($customer)
            ->patch(route('admin.transfers.update', $transfer), ['amount' => '150.00', 'description' => 'Corrected transfer'])
            ->assertRedirect(route('admin.login'));

        $this->actingAs($admin)
            ->patch(route('admin.transfers.update', $transfer), ['amount' => '150.00', 'description' => 'Corrected transfer'])
            ->assertRedirect();

        $this->assertDatabaseHas('transfers', ['id' => $transfer->id, 'amount' => '150.00', 'fee_amount' => '1.20', 'description' => 'Corrected transfer']);
        $this->assertSame('848.80', (string) $source->fresh()->balance);
        $this->assertSame('150.00', (string) $destination->fresh()->balance);
        $this->assertDatabaseHas('transactions', ['id' => $sourceTransaction->id, 'amount' => '151.20', 'description' => 'Corrected transfer (includes fee)']);
        $this->assertDatabaseHas('transactions', ['id' => $destinationTransaction->id, 'amount' => '150.00', 'description' => 'Corrected transfer']);
    }

    public function test_admin_can_mark_a_completed_transfer_failed_and_completed_again(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $source = Account::factory()->for($customer)->create(['balance' => '899.20']);
        $destination = Account::factory()->for($customer)->create(['balance' => '100.00']);
        $transfer = Transfer::query()->create([
            'user_id' => $customer->id,
            'source_account_id' => $source->id,
            'destination_account_id' => $destination->id,
            'transfer_type' => 'internal',
            'status' => 'completed',
            'amount' => '100.00',
            'fee_amount' => '0.80',
            'currency' => 'USD',
        ]);
        $sourceTransaction = Transaction::factory()->for($source)->create(['transfer_id' => $transfer->id, 'transaction_type' => 'Debit', 'status' => 'completed', 'amount' => '100.80']);
        $destinationTransaction = Transaction::factory()->for($destination)->create(['transfer_id' => $transfer->id, 'transaction_type' => 'Credit', 'status' => 'completed', 'amount' => '100.00']);

        $this->actingAs($admin)
            ->patch(route('admin.transfers.update', $transfer), ['status' => 'failed'])
            ->assertRedirect();

        $this->assertSame('failed', $transfer->fresh()->status);
        $this->assertSame('1000.00', (string) $source->fresh()->balance);
        $this->assertSame('0.00', (string) $destination->fresh()->balance);
        $this->assertSame('failed', $sourceTransaction->fresh()->status);
        $this->assertSame('failed', $destinationTransaction->fresh()->status);

        $this->patch(route('admin.transfers.update', $transfer), [
            'status' => 'completed',
            'date' => '2026-07-24',
            'time' => '13:40',
        ])
            ->assertRedirect();

        $this->assertSame('completed', $transfer->fresh()->status);
        $this->assertSame('899.20', (string) $source->fresh()->balance);
        $this->assertSame('100.00', (string) $destination->fresh()->balance);
        $this->assertSame('completed', $sourceTransaction->fresh()->status);
        $this->assertSame('completed', $destinationTransaction->fresh()->status);
        $this->assertSame('2026-07-24 13:40', $transfer->fresh()->created_at->format('Y-m-d H:i'));
        $this->assertSame('2026-07-24 13:40', $sourceTransaction->fresh()->created_at->format('Y-m-d H:i'));
        $this->assertSame('2026-07-24 13:40', $destinationTransaction->fresh()->created_at->format('Y-m-d H:i'));
    }

    public function test_customer_cannot_list_admin_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.users.index'))
            ->assertRedirect(route('admin.login'));
    }
}
