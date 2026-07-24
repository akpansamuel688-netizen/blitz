<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\DebitCard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DebitCardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('cards/index', [
            'accounts' => $user->accounts()->orderBy('name')->get()->map(fn (Account $account) => ['id' => $account->id, 'name' => $account->name, 'type' => $account->type, 'currency' => $account->currency]),
            'cards' => DebitCard::query()->with('account:id,name')->where('user_id', $user->id)
                ->whereNotIn('status', ['cancelled', 'rejected'])->latest()->get()->map(fn (DebitCard $card) => [
                'id' => $card->id, 'type' => $card->card_type, 'status' => $card->status, 'last_four' => $card->last_four,
                'expires_at' => $card->expires_at?->format('m/y'), 'account_name' => $card->account?->name ?? 'Account',
            ]),
        ]);
    }

    public function storeVirtual(Request $request): RedirectResponse
    {
        return $this->create($request, 'virtual');
    }

    public function requestPhysical(Request $request): RedirectResponse
    {
        return $this->create($request, 'physical');
    }

    public function details(Request $request, DebitCard $card): JsonResponse
    {
        $this->ensureOwnedByUser($request, $card);
        abort_unless($card->status === 'active' && $card->card_number && $card->cvv, 404);

        return response()->json([
            'card_number' => $card->card_number,
            'cvv' => $card->cvv,
            'expires_at' => $card->expires_at?->format('m/y'),
        ]);
    }

    public function cancelPhysicalRequest(Request $request, DebitCard $card): RedirectResponse
    {
        $this->ensureOwnedByUser($request, $card);
        abort_unless($card->card_type === 'physical' && $card->status === 'requested', 404);

        $card->update(['status' => 'cancelled']);

        return back()->with('success', 'Physical debit card request cancelled.');
    }

    public function destroyVirtual(Request $request, DebitCard $card): RedirectResponse
    {
        $this->ensureOwnedByUser($request, $card);
        abort_unless($card->card_type === 'virtual', 404);

        $card->delete();

        return back()->with('success', 'Virtual debit card deleted.');
    }

    private function create(Request $request, string $type): RedirectResponse
    {
        $data = $request->validate(['account_id' => ['required', 'integer', 'exists:accounts,id']]);
        $account = Account::query()->where('user_id', $request->user()->id)->findOrFail($data['account_id']);

        if (DebitCard::query()->where('account_id', $account->id)->where('card_type', $type)->whereIn('status', ['active', 'requested'])->exists()) {
            return back()->withErrors(['account_id' => "This account already has a {$type} debit card."]);
        }

        $number = $this->cardNumber();
        DebitCard::query()->create([
            'user_id' => $request->user()->id,
            'account_id' => $account->id,
            'card_type' => $type,
            'status' => $type === 'virtual' ? 'active' : 'requested',
            'card_number_hash' => hash('sha256', $number),
            'card_number' => $type === 'virtual' ? $number : null,
            'cvv' => $type === 'virtual' ? str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT) : null,
            'last_four' => substr($number, -4),
            'expires_at' => now()->addYears(3)->endOfMonth(),
        ]);

        return back()->with('success', $type === 'virtual' ? 'Virtual debit card created.' : 'Physical debit card request submitted.');
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

    private function ensureOwnedByUser(Request $request, DebitCard $card): void
    {
        abort_unless($card->user_id === $request->user()->id, 404);
    }
}
