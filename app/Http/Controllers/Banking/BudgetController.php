<?php

namespace App\Http\Controllers\Banking;

use App\Models\Budget;
use App\Models\TransactionCategory;
use App\Support\Money;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $budgets = Budget::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with('category:id,name')
            ->orderByDesc('period_start')
            ->get()
            ->map(function (Budget $budget) {
                $limit = (float) $budget->limit;
                $spent = (float) $budget->spent;

                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'limit' => Money::format($limit),
                    'spent' => Money::format($spent),
                    'period' => $budget->period,
                    'period_start' => $budget->period_start?->toDateString(),
                    'period_end' => $budget->period_end?->toDateString(),
                    'percentage' => $limit > 0 ? min(100, round(($spent / $limit) * 100, 1)) : 0,
                    'category_name' => $budget->category?->name ?? 'All categories',
                ];
            });

        $categories = TransactionCategory::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'limit' => ['required', 'numeric', 'min:0.01'],
            'period' => ['required', 'in:monthly,quarterly,yearly'],
            'period_start' => ['required', 'date'],
            'category_id' => [
                'nullable',
                Rule::exists('transaction_categories', 'id')->where(fn ($q) => $q->where('user_id', $user->id)),
            ],
        ]);

        $start = Carbon::parse($validated['period_start'])->startOfDay();
        $end = match ($validated['period']) {
            'monthly' => $start->copy()->addMonth()->subDay(),
            'quarterly' => $start->copy()->addMonths(3)->subDay(),
            'yearly' => $start->copy()->addYear()->subDay(),
        };

        $user->budgets()->create([
            'name' => $validated['name'],
            'limit' => $validated['limit'],
            'period' => $validated['period'],
            'period_start' => $start,
            'period_end' => $end,
            'category_id' => $validated['category_id'] ?? null,
            'spent' => 0,
            'is_active' => true,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Budget created successfully.',
        ]);

        return back();
    }
}
