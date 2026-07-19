<?php

namespace App\Http\Controllers\Banking;

use App\Models\SavingsGoal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(Request $request): Response
    {
        $goals = SavingsGoal::where('user_id', $request->user()->id)
            ->with('account')
            ->get();

        return Inertia::render('savings-goals/index', [
            'goals' => $goals->map(fn ($goal) => [
                'id' => $goal->id,
                'name' => $goal->name,
                'description' => $goal->description,
                'target_amount' => number_format($goal->target_amount, 2, '.', ''),
                'current_amount' => number_format($goal->current_amount, 2, '.', ''),
                'target_date' => $goal->target_date?->toDateString(),
                'status' => $goal->status,
                'percentage' => min(100, ($goal->current_amount / $goal->target_amount) * 100),
                'color' => $goal->color,
                'account_name' => $goal->account?->name ?? 'No account linked',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'target_date' => ['nullable', 'date'],
            'account_id' => ['nullable', 'exists:accounts,id'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $request->user()->savingsGoals()->create(array_merge($validated, ['status' => 'active']));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Savings goal created successfully.',
        ]);

        return back();
    }
}
