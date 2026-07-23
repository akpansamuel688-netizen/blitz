<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransferController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $type = $request->string('type')->toString();

        $transfers = Transfer::query()
            ->with(['user:id,name,email', 'sourceAccount:id,name', 'destinationAccount:id,name'])
            ->when(in_array($status, ['pending', 'completed', 'failed'], true), fn ($query) => $query->where('status', $status))
            ->when(in_array($type, ['internal', 'domestic', 'wire'], true), fn ($query) => $query->where('transfer_type', $type))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Transfer $transfer) => [
                'id' => $transfer->id,
                'type' => $transfer->transfer_type,
                'status' => $transfer->status,
                'amount' => Money::format($transfer->amount),
                'fee' => Money::format($transfer->fee_amount),
                'currency' => $transfer->currency,
                'customer' => $transfer->user?->name ?? 'Deleted user',
                'customer_email' => $transfer->user?->email ?? '',
                'source_account' => $transfer->sourceAccount?->name ?? 'Account',
                'recipient' => $transfer->destinationAccount?->name ?? $transfer->recipient_name,
                'bank_name' => $transfer->bank_name,
                'description' => $transfer->description,
                'created_at' => $transfer->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/transfers', [
            'transfers' => $transfers,
            'filters' => ['status' => $status, 'type' => $type],
        ]);
    }

    public function update(Request $request, Transfer $transfer): RedirectResponse
    {
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
