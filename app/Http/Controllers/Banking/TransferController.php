<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banking\StoreTransferRequest;
use App\Models\Account;
use App\Models\Beneficiary;
use App\Models\Transfer;
use App\Services\Banking\TransferService;
use App\Services\Banking\ExchangeRateService;
use App\Services\Security\TransferAuthorizationService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransferController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $transfers = Transfer::query()->where('user_id', $user->id)
            ->with(['sourceAccount:id,name,account_number', 'destinationAccount:id,name,account_number'])
            ->latest()->limit(50)->get()
            ->map(fn (Transfer $transfer) => [
                'id' => $transfer->id, 'transfer_type' => $transfer->transfer_type, 'status' => $transfer->status,
                'amount' => Money::format($transfer->amount), 'fee_amount' => Money::format($transfer->fee_amount), 'currency' => $transfer->currency,
                'source_account_name' => $transfer->sourceAccount?->name ?? 'Account',
                'destination_name' => $transfer->destinationAccount?->name ?? $transfer->recipient_name,
                'bank_name' => $transfer->bank_name, 'description' => $transfer->description,
                'created_at' => $transfer->created_at?->toIso8601String(),
                'completed_at' => $transfer->completed_at?->toIso8601String(),
            ]);

        $accounts = Account::query()->where('user_id', $user->id)
            ->orderBy('name')->get(['id', 'name', 'account_number', 'balance', 'currency']);
        $beneficiaries = Beneficiary::query()->where('user_id', $user->id)->orderBy('name')->get();
        return Inertia::render('transfers/index', [
            'accounts' => $accounts,
            'transfers' => $transfers,
            'beneficiaries' => $beneficiaries,
            'wireDestinations' => collect(config('wire.destinations'))->map(fn (string $currency, string $country) => [
                'country' => $country,
                'currency' => $currency,
            ])->values(),
        ]);
    }

    public function wireQuote(Request $request, ExchangeRateService $rates): JsonResponse
    {
        $data = $request->validate([
            'source_account_id' => ['required', 'integer'],
            'destination_country' => ['required', Rule::in(array_keys(config('wire.destinations')))],
            'amount' => ['required', 'regex:/^\d{1,16}(\.\d{1,2})?$/', 'not_in:0,0.0,0.00'],
        ]);

        $account = Account::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($data['source_account_id']);
        $recipientCurrency = config('wire.destinations.'.$data['destination_country']);

        try {
            $quote = $rates->quote($account->currency, $recipientCurrency, $data['amount']);
        } catch (\RuntimeException) {
            return response()->json(['message' => 'The exchange-rate estimate is temporarily unavailable.'], 503);
        }

        return response()->json([
            ...$quote,
            'source_currency' => $account->currency,
            'recipient_currency' => $recipientCurrency,
            'destination_country' => $data['destination_country'],
            'indicative' => true,
        ]);
    }

    public function store(StoreTransferRequest $request, TransferAuthorizationService $authorizations, ExchangeRateService $rates): RedirectResponse
    {
        $data = $request->validated();
        $data['source_account_number'] = Account::query()->where('user_id', $request->user()->id)->findOrFail($data['source_account_id'])->account_number;
        if (! empty($data['destination_account_id'])) $data['destination_account_number'] = Account::query()->where('user_id', $request->user()->id)->findOrFail($data['destination_account_id'])->account_number;
        if ($data['transfer_type'] === 'wire') {
            $source = Account::query()->where('user_id', $request->user()->id)->findOrFail($data['source_account_id']);
            try {
                $data['exchange_quote'] = $rates->quote($source->currency, $data['recipient_currency'], $data['amount']);
            } catch (\RuntimeException) {
                return back()->withErrors(['destination_country' => 'The exchange-rate estimate is temporarily unavailable. Please try again.'])->withInput();
            }
        }
        $authorization = $authorizations->start($request->user(), $data, $request);
        $verification = $authorization->otpVerifications()->latest('id')->firstOrFail();
        $request->session()->put(['otp_transaction_authorization_id' => $authorization->id, 'otp_transaction_verification_id' => $verification->id]);
        return redirect()->route('security.transaction.show');
    }

    public function update(Request $request, Transfer $transfer): RedirectResponse
    {
        abort_unless($transfer->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'description' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['nullable', 'string', 'max:150'],
            'bank_name' => ['nullable', 'string', 'max:150'],
            'recipient_account_number' => ['nullable', 'string', 'max:34'],
            'iban' => ['nullable', 'string', 'max:34'],
            'swift_bic' => ['nullable', 'string', 'max:11'],
        ]);

        $transfer->update($data);

        return back();
    }
}
