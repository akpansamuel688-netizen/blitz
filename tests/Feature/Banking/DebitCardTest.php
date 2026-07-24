<?php

namespace Tests\Feature\Banking;

use App\Models\Account;
use App\Models\DebitCard;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DebitCardTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_their_cards_page(): void
    {
        $user = User::factory()->create();
        Account::factory()->for($user)->create();

        $this->actingAs($user)->get(route('cards.index'))->assertOk();
    }

    public function test_customer_can_create_a_virtual_debit_card_with_encrypted_details(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();

        $this->actingAs($user)
            ->post(route('cards.virtual.store'), ['account_id' => $account->id])
            ->assertRedirect();

        $card = DebitCard::query()->sole();

        $this->assertSame($user->id, $card->user_id);
        $this->assertSame($account->id, $card->account_id);
        $this->assertSame('virtual', $card->card_type);
        $this->assertSame('active', $card->status);
        $this->assertMatchesRegularExpression('/^4000\d{12}$/', $card->card_number);
        $this->assertSame(substr($card->card_number, -4), $card->last_four);
        $this->assertNotSame($card->card_number, DB::table('debit_cards')->value('card_number'));
        $this->assertNotSame($card->cvv, DB::table('debit_cards')->value('cvv'));
    }

    public function test_customer_can_request_a_physical_debit_card(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();

        $this->actingAs($user)
            ->post(route('cards.physical.store'), ['account_id' => $account->id])
            ->assertRedirect();

        $this->assertDatabaseHas('debit_cards', [
            'user_id' => $user->id,
            'account_id' => $account->id,
            'card_type' => 'physical',
            'status' => 'requested',
        ]);
    }

    public function test_customer_cannot_create_a_card_for_another_customers_account(): void
    {
        $user = User::factory()->create();
        $otherAccount = Account::factory()->create();

        $this->actingAs($user)
            ->post(route('cards.virtual.store'), ['account_id' => $otherAccount->id])
            ->assertNotFound();

        $this->assertDatabaseCount('debit_cards', 0);
    }

    public function test_customer_cannot_create_two_active_virtual_cards_for_the_same_account(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();

        $this->actingAs($user)->post(route('cards.virtual.store'), ['account_id' => $account->id]);
        $this->actingAs($user)->post(route('cards.virtual.store'), ['account_id' => $account->id])
            ->assertSessionHasErrors('account_id');

        $this->assertDatabaseCount('debit_cards', 1);
    }

    public function test_customer_can_cancel_their_requested_physical_card(): void
    {
        $user = User::factory()->create();
        $card = DebitCard::query()->create([
            'user_id' => $user->id, 'account_id' => Account::factory()->for($user)->create()->id,
            'card_type' => 'physical', 'status' => 'requested', 'card_number_hash' => hash('sha256', '4000000000000002'),
            'last_four' => '0002', 'expires_at' => now()->addYears(3),
        ]);

        $this->actingAs($user)->delete(route('cards.physical.cancel', $card))->assertRedirect();

        $this->assertDatabaseHas('debit_cards', ['id' => $card->id, 'status' => 'cancelled']);
    }

    public function test_customer_can_delete_their_virtual_card(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        $this->actingAs($user)->post(route('cards.virtual.store'), ['account_id' => $account->id]);
        $card = DebitCard::query()->sole();

        $this->actingAs($user)->delete(route('cards.virtual.destroy', $card))->assertRedirect();

        $this->assertDatabaseMissing('debit_cards', ['id' => $card->id]);
    }

    public function test_customer_cannot_delete_another_customers_virtual_card(): void
    {
        $owner = User::factory()->create();
        $account = Account::factory()->for($owner)->create();
        $this->actingAs($owner)->post(route('cards.virtual.store'), ['account_id' => $account->id]);
        $card = DebitCard::query()->sole();

        $this->actingAs(User::factory()->create())
            ->delete(route('cards.virtual.destroy', $card))
            ->assertNotFound();

        $this->assertDatabaseHas('debit_cards', ['id' => $card->id]);
    }

    public function test_virtual_card_delete_route_rejects_physical_cards(): void
    {
        $user = User::factory()->create();
        $card = DebitCard::query()->create([
            'user_id' => $user->id, 'account_id' => Account::factory()->for($user)->create()->id,
            'card_type' => 'physical', 'status' => 'requested', 'card_number_hash' => hash('sha256', '4000000000000010'),
            'last_four' => '0010', 'expires_at' => now()->addYears(3),
        ]);

        $this->actingAs($user)
            ->delete(route('cards.virtual.destroy', $card))
            ->assertNotFound();

        $this->assertDatabaseHas('debit_cards', ['id' => $card->id]);
    }

    public function test_customer_can_reveal_only_their_active_virtual_card_details(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        $this->actingAs($user)->post(route('cards.virtual.store'), ['account_id' => $account->id]);
        $card = DebitCard::query()->sole();

        $this->actingAs($user)->get(route('cards.details', $card))
            ->assertOk()
            ->assertJsonPath('card_number', $card->card_number)
            ->assertJsonPath('cvv', $card->cvv);

        $otherUser = User::factory()->create();
        $this->actingAs($otherUser)->get(route('cards.details', $card))->assertNotFound();
    }

    public function test_customer_can_reveal_an_approved_physical_card(): void
    {
        $user = User::factory()->create();
        $card = DebitCard::query()->create([
            'user_id' => $user->id, 'account_id' => Account::factory()->for($user)->create()->id,
            'card_type' => 'physical', 'status' => 'active', 'card_number_hash' => hash('sha256', '4000000000000002'),
            'card_number' => '4000000000000002', 'cvv' => '321', 'last_four' => '0002', 'expires_at' => now()->addYears(3),
        ]);

        $this->actingAs($user)->get(route('cards.details', $card))
            ->assertOk()
            ->assertJsonPath('card_number', '4000000000000002')
            ->assertJsonPath('cvv', '321');
    }
}
