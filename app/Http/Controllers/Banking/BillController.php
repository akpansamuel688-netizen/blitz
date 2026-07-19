<?php

namespace App\Http\Controllers\Banking;

use App\Models\Account;
use App\Models\Bill;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $bills = Bill::query()
            ->where('user_id', $user->id)
            ->with('account:id,name')
            ->orderBy('next_due_date')
            ->get()
            ->map(function (Bill $bill) {
                $status = $bill->status;

                if ($status === 'pending' && $bill->next_due_date?->isPast()) {
                    $status = 'overdue';
                }

                return [
                    'id' => $bill->id,
                    'name' => $bill->name,
                    'amount' => Money::format($bill->amount),
                    'frequency' => $bill->frequency,
                    'next_due_date' => $bill->next_due_date?->toDateString(),
                    'status' => $status,
                    'category' => $bill->category,
                    'auto_pay' => (bool) $bill->auto_pay,
                    'account_name' => $bill->account?->name ?? '—',
                ];
            });

        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('bills/index', [
            'bills' => $bills,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['required', 'in:monthly,quarterly,annually'],
            'next_due_date' => ['required', 'date'],
            'category' => ['nullable', 'string', 'max:100'],
            'auto_pay' => ['sometimes', 'boolean'],
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('user_id', $user->id)),
            ],
        ]);

        $user->bills()->create([
            ...$validated,
            'auto_pay' => $request->boolean('auto_pay'),
            'status' => 'pending',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Bill added successfully.',
        ]);

        return back();
    }
}
