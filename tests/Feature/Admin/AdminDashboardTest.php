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
            ->assertRedirect(route('login'));
    }

    public function test_non_admin_users_are_forbidden(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
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

    public function test_customer_cannot_list_admin_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }
}
