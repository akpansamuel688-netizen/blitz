<?php

namespace App\Http\Controllers\Banking;

use App\Models\RecurringTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransferController extends Controller
{
    public function index(Request $request): Response
    {
        $transfers = RecurringTransfer::where('user_id', $request->user()->id)
            ->with(['sourceAccount', 'destinationAccount'])
            ->get();

        return Inertia::render('recurring-transfers/index', [
            'transfers' => $transfers->map(fn ($t) => [
                'id' => $t->id,
                'source_account' => $t->sourceAccount->name,
                'destination_account' => $t->destinationAccount->name,
                'amount' => number_format($t->amount, 2, '.', ''),
                'frequency' => $t->frequency,
                'next_transfer_date' => $t->next_transfer_date->toDateString(),
                'is_active' => $t->is_active,
                'description' => $t->description,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_account_id' => ['required', 'exists:accounts,id'],
            'destination_account_id' => ['required', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:daily,weekly,biweekly,monthly'],
            'next_transfer_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:next_transfer_date'],
            'description' => ['nullable', 'string'],
        ]);

        $request->user()->recurringTransfers()->create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Recurring transfer scheduled successfully.',
        ]);

        return back();
    }
}
