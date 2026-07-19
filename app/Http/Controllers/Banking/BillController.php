<?php

namespace App\Http\Controllers\Banking;

use App\Models\Bill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    public function index(Request $request): Response
    {
        $bills = Bill::where('user_id', $request->user()->id)
            ->with('account')
            ->get();

        return Inertia::render('bills/index', [
            'bills' => $bills->map(fn ($bill) => [
                'id' => $bill->id,
                'name' => $bill->name,
                'amount' => number_format($bill->amount, 2, '.', ''),
                'frequency' => $bill->frequency,
                'next_due_date' => $bill->next_due_date->toDateString(),
                'status' => $bill->status,
                'category' => $bill->category,
                'auto_pay' => $bill->auto_pay,
                'account_name' => $bill->account->name,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:monthly,quarterly,annually'],
            'next_due_date' => ['required', 'date'],
            'category' => ['nullable', 'string'],
            'auto_pay' => ['boolean'],
            'account_id' => ['required', 'exists:accounts,id'],
        ]);

        $request->user()->bills()->create(array_merge($validated, ['status' => 'pending']));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Bill added successfully.',
        ]);

        return back();
    }
}
