<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banking\StoreTransferRequest;
use App\Models\Account;
use App\Models\Beneficiary;
use App\Models\Transfer;
use App\Services\Banking\TransferService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);
    }

    public function store(StoreTransferRequest $request, TransferService $transferService): RedirectResponse
    {
        $transferService->create($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transfer completed successfully.']);

        return back();
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
