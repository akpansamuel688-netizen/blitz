<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_includes_account_and_activity_props(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create([
            'balance' => 1000,
            'type' => 'Checking',
        ]);

        Transaction::factory()->for($account)->create([
            'transaction_type' => 'Credit',
            'amount' => 250,
        ]);

        $this->actingAs($user);

        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('accounts', 1)
            ->has('stats')
            ->where('stats.accountCount', 1)
            ->where('stats.totalBalance', '1000.00')
            ->has('recentTransactions')
            ->has('activityByDay', 7)
            ->where('userName', $user->name)
        );
    }

    public function test_dashboard_money_totals_include_completed_admin_style_ledger_entries_from_any_date(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        Transaction::factory()->for($account)->create([
            'transaction_type' => 'Credit',
            'status' => 'completed',
            'amount' => 125,
            'created_at' => now()->subMonths(6),
        ]);
        Transaction::factory()->for($account)->create([
            'transaction_type' => 'Debit',
            'status' => 'completed',
            'amount' => 30,
            'created_at' => now()->subMonths(5),
        ]);
        Transaction::factory()->for($account)->create([
            'transaction_type' => 'Credit',
            'status' => 'failed',
            'amount' => 999,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.moneyIn', '125.00')
                ->where('stats.moneyOut', '30.00')
            );
    }
}
