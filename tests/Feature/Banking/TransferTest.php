<?php

namespace Tests\Feature\Banking;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_complete_internal_transfer_and_create_balanced_ledger_entries(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '100.00', 'currency' => 'USD']);
        $destination = Account::factory()->for($user)->create(['balance' => '20.00', 'currency' => 'USD']);

        $this->actingAs($user)->post(route('transfers.store'), [
            'transfer_type' => 'internal',
            'source_account_id' => $source->id,
            'destination_account_id' => $destination->id,
            'amount' => '25.50',
            'description' => 'Monthly savings',
        ])->assertRedirect();

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '74.30']);
        $this->assertDatabaseHas('accounts', ['id' => $destination->id, 'balance' => '45.50']);
        $this->assertDatabaseHas('transfers', ['user_id' => $user->id, 'transfer_type' => 'internal', 'status' => 'completed', 'fee_amount' => '0.20']);
        $this->assertDatabaseCount('transactions', 2);
    }

    public function test_user_can_send_domestic_and_wire_transfers(): void
    {
        Http::fake([
            'api.frankfurter.dev/*' => Http::response([
                'date' => '2026-07-24',
                'base' => 'USD',
                'quote' => 'EUR',
                'rate' => 0.85,
            ]),
        ]);
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '1000.00', 'currency' => 'USD']);

        $this->actingAs($user)->post(route('transfers.store'), [
            'transfer_type' => 'domestic', 'source_account_id' => $source->id, 'amount' => '150.00',
            'recipient_name' => 'Taylor Smith', 'recipient_account_number' => '1234567890', 'bank_name' => 'Example Bank',
        ])->assertRedirect();

        $this->post(route('transfers.store'), [
            'transfer_type' => 'wire', 'source_account_id' => $source->id, 'amount' => '200.00',
            'recipient_name' => 'Avery Jones', 'wire_bank_name' => 'International Bank',
            'swift_bic' => 'DEUTDEFF', 'iban' => 'DE89370400440532013000',
            'destination_country' => 'Germany', 'recipient_currency' => 'EUR',
        ])->assertRedirect();

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '647.20']);
        $this->assertDatabaseHas('transfers', ['transfer_type' => 'domestic', 'bank_name' => 'Example Bank', 'status' => 'completed', 'fee_amount' => '1.20']);
        $this->assertDatabaseHas('transfers', ['transfer_type' => 'wire', 'swift_bic' => 'DEUTDEFF', 'status' => 'completed', 'fee_amount' => '1.60']);
        $this->assertDatabaseCount('transactions', 2);
    }

    public function test_customer_can_request_a_wire_exchange_rate_quote_for_an_owned_account(): void
    {
        Http::fake([
            'api.frankfurter.dev/*' => Http::response([
                'date' => '2026-07-24',
                'base' => 'USD',
                'quote' => 'EUR',
                'rate' => 0.85,
            ]),
        ]);

        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create(['currency' => 'USD']);

        $this->actingAs($user)->getJson(route('transfers.wire-quote', [
            'source_account_id' => $account->id,
            'destination_country' => 'Germany',
            'amount' => '1.00',
        ]))
            ->assertOk()
            ->assertJsonPath('recipient_currency', 'EUR')
            ->assertJsonPath('recipient_amount', '0.85')
            ->assertJsonPath('rate', 0.85);
    }

    public function test_customer_cannot_quote_from_another_customers_account(): void
    {
        $user = User::factory()->create();
        $otherAccount = Account::factory()->for(User::factory()->create())->create();

        $this->actingAs($user)->getJson(route('transfers.wire-quote', [
            'source_account_id' => $otherAccount->id,
            'destination_country' => 'Germany',
            'amount' => '1.00',
        ]))->assertNotFound();
    }

    public function test_transfer_is_rejected_when_source_balance_is_insufficient(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '10.00']);
        $destination = Account::factory()->for($user)->create(['balance' => '0.00']);

        $this->actingAs($user)->from(route('transfers.index'))->post(route('transfers.store'), [
            'transfer_type' => 'internal', 'source_account_id' => $source->id,
            'destination_account_id' => $destination->id, 'amount' => '10.01',
        ])->assertSessionHasErrors('amount');

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '10.00']);
        $this->assertDatabaseCount('transfers', 0);
        $this->assertDatabaseCount('transactions', 0);
    }
}
