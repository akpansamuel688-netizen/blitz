<?php

namespace Tests\Feature\Banking;

use App\Models\Account;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MoneyToolsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_money_tool_pages(): void
    {
        $user = User::factory()->create();
        Account::factory()->for($user)->count(2)->create();

        $this->actingAs($user);

        $this->get(route('categories.index'))->assertOk();
        $this->get(route('bills.index'))->assertOk();
        $this->get(route('budgets.index'))->assertOk();
        $this->get(route('recurring-transfers.index'))->assertOk();
        $this->get(route('savings-goals.index'))->assertOk();
    }

    public function test_user_can_create_category(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('categories.store'), [
                'name' => 'Travel',
                'color' => '#0F6B66',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transaction_categories', [
            'user_id' => $user->id,
            'name' => 'Travel',
            'color' => '#0F6B66',
        ]);
    }

    public function test_user_can_create_bill_for_own_account(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();

        $this->actingAs($user)
            ->post(route('bills.store'), [
                'name' => 'Internet',
                'amount' => 79.99,
                'frequency' => 'monthly',
                'next_due_date' => now()->addWeek()->toDateString(),
                'account_id' => $account->id,
                'category' => 'Utilities',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bills', [
            'user_id' => $user->id,
            'account_id' => $account->id,
            'name' => 'Internet',
        ]);
    }

    public function test_user_cannot_attach_bill_to_another_users_account(): void
    {
        $user = User::factory()->create();
        $otherAccount = Account::factory()->create();

        $this->actingAs($user)
            ->post(route('bills.store'), [
                'name' => 'Hacked bill',
                'amount' => 10,
                'frequency' => 'monthly',
                'next_due_date' => now()->addWeek()->toDateString(),
                'account_id' => $otherAccount->id,
            ])
            ->assertSessionHasErrors('account_id');
    }

    public function test_user_can_create_budget_and_recurring_transfer_and_goal(): void
    {
        $user = User::factory()->create();
        $checking = Account::factory()->for($user)->create(['type' => 'Checking']);
        $savings = Account::factory()->for($user)->create(['type' => 'Savings']);
        $category = TransactionCategory::query()->create([
            'user_id' => $user->id,
            'name' => 'Dining',
            'color' => '#F59E0B',
        ]);

        $this->actingAs($user);

        $this->post(route('budgets.store'), [
            'name' => 'Dining budget',
            'limit' => 250,
            'period' => 'monthly',
            'period_start' => now()->toDateString(),
            'category_id' => $category->id,
        ])->assertRedirect();

        $this->post(route('recurring-transfers.store'), [
            'source_account_id' => $checking->id,
            'destination_account_id' => $savings->id,
            'amount' => 100,
            'frequency' => 'monthly',
            'next_transfer_date' => now()->addDay()->toDateString(),
            'description' => 'Monthly save',
        ])->assertRedirect();

        $this->post(route('savings-goals.store'), [
            'name' => 'Vacation',
            'target_amount' => 3000,
            'account_id' => $savings->id,
            'color' => '#0F6B66',
        ])->assertRedirect();

        $this->assertDatabaseCount('budgets', 1);
        $this->assertDatabaseCount('recurring_transfers', 1);
        $this->assertDatabaseCount('savings_goals', 1);
    }
}
