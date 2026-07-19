<?php

namespace App\Http\Controllers\Banking;

use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = TransactionCategory::query()
            ->where('user_id', $request->user()->id)
            ->withCount('transactions')
            ->orderBy('name')
            ->get()
            ->map(fn (TransactionCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'color' => $cat->color,
                'icon' => $cat->icon,
                'transaction_count' => $cat->transactions_count,
            ]);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $request->user()->transactionCategories()->create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Category created successfully.',
        ]);

        return back();
    }
}
