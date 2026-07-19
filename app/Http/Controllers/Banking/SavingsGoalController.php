<?php

namespace App\Http\Controllers\Banking;

use App\Models\Account;
use App\Models\SavingsGoal;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $goals = SavingsGoal::query()
            ->where('user_id', $user->id)
            ->with('account:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (SavingsGoal $goal) {
                $target = (float) $goal->target_amount;
                $current = (float) $goal->current_amount;

                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'description' => $goal->description,
                    'target_amount' => Money::format($target),
                    'current_amount' => Money::format($current),
                    'target_date' => $goal->target_date?->toDateString(),
                    'status' => $goal->status,
                    'percentage' => $target > 0 ? min(100, round(($current / $target) * 100, 1)) : 0,
                    'color' => $goal->color ?: '#10b981',
                    'account_name' => $goal->account?->name ?? 'No account linked',
                ];
            });

        $accounts = Account::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('savings-goals/index', [
            'goals' => $goals,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'target_date' => ['nullable', 'date', 'after_or_equal:today'],
            'account_id' => [
                'nullable',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('user_id', $user->id)),
            ],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $user->savingsGoals()->create([
            ...$validated,
            'current_amount' => 0,
            'status' => 'active',
            'color' => $validated['color'] ?? '#10b981',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Savings goal created successfully.',
        ]);

        return back();
    }
}
