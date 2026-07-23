<?php

namespace Tests\Feature\Admin;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                'account_id' => $account->id,
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

    public function test_customer_cannot_list_admin_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.users.index'))
            ->assertRedirect(route('admin.login'));
    }
}
