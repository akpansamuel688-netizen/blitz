<?php

namespace Tests\Feature\Admin;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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

        $this->assertSame('576.50', (string) $account->fresh()->balance);
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
        $this->assertSame('540.00', (string) $firstAccount->fresh()->balance);
        $this->assertSame('240.00', (string) $secondAccount->fresh()->balance);
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
        $this->assertSame('50.00', (string) $account->balance);
        $this->assertDatabaseHas('transactions', ['account_id' => $account->id, 'amount' => '50.00']);
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

    public function test_customer_cannot_list_admin_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.users.index'))
            ->assertRedirect(route('admin.login'));
    }
}
