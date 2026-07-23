<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DebitCard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DebitCardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/cards/index', [
            'requests' => DebitCard::query()
                ->with(['user:id,name,email', 'account:id,name,account_number'])
                ->where('card_type', 'physical')
                ->where('status', 'requested')
                ->latest()
                ->get()
                ->map(fn (DebitCard $card) => [
                    'id' => $card->id,
                    'customer_name' => $card->user?->name ?? 'Deleted customer',
                    'customer_email' => $card->user?->email ?? '',
                    'account_name' => $card->account?->name ?? 'Account',
                    'account_number' => $card->account?->account_number ?? '',
                    'requested_at' => $card->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function approve(DebitCard $card): RedirectResponse
    {
        DB::transaction(function () use ($card): void {
            $lockedCard = DebitCard::query()->lockForUpdate()->findOrFail($card->id);
            abort_unless($lockedCard->card_type === 'physical' && $lockedCard->status === 'requested', 404);

            $number = $this->cardNumber();
            $lockedCard->update([
                'status' => 'active',
                'card_number_hash' => hash('sha256', $number),
                'card_number' => $number,
                'cvv' => str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT),
                'last_four' => substr($number, -4),
                'expires_at' => now()->addYears(3)->endOfMonth(),
            ]);
        });

        return back()->with('success', 'Physical debit card approved and issued.');
    }

    public function reject(DebitCard $card): RedirectResponse
    {
        abort_unless($card->card_type === 'physical' && $card->status === 'requested', 404);
        $card->update(['status' => 'rejected']);

        return back()->with('success', 'Physical debit card request rejected.');
    }

    private function cardNumber(): string
    {
        do {
            $partial = '4000'.implode('', array_map(fn () => (string) random_int(0, 9), range(1, 11)));
            $sum = 0;
            foreach (array_reverse(str_split($partial)) as $index => $digit) {
                $value = (int) $digit;
                if ($index % 2 === 0) { $value *= 2; if ($value > 9) $value -= 9; }
                $sum += $value;
            }
            $number = $partial.((10 - ($sum % 10)) % 10);
        } while (DebitCard::query()->where('card_number_hash', hash('sha256', $number))->exists());

        return $number;
    }
}
