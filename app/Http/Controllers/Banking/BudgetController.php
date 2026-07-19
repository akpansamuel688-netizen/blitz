<?php

namespace App\Http\Controllers\Banking;

use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $budgets = Budget::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with('category')
            ->get();

        return Inertia::render('budgets/index', [
            'budgets' => $budgets->map(fn ($budget) => [
                'id' => $budget->id,
                'name' => $budget->name,
                'limit' => number_format($budget->limit, 2, '.', ''),
                'spent' => number_format($budget->spent, 2, '.', ''),
                'period' => $budget->period,
                'period_start' => $budget->period_start->toDateString(),
                'period_end' => $budget->period_end->toDateString(),
                'percentage' => min(100, ($budget->spent / $budget->limit) * 100),
                'category_name' => $budget->category?->name ?? 'All Categories',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'limit' => ['required', 'numeric', 'min:0.01'],
            'period' => ['required', 'in:monthly,quarterly,yearly'],
            'period_start' => ['required', 'date'],
            'category_id' => ['nullable', 'exists:transaction_categories,id'],
        ]);

        $start = Carbon::parse($validated['period_start']);
        $end = match ($validated['period']) {
            'monthly' => $start->addMonth()->subDay(),
            'quarterly' => $start->addQuarter()->subDay(),
            'yearly' => $start->addYear()->subDay(),
        };

        $request->user()->budgets()->create(array_merge($validated, [
            'period_end' => $end,
            'spent' => 0,
        ]));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Budget created successfully.',
        ]);

        return back();
    }
}
