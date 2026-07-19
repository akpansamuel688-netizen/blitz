<?php

namespace App\Http\Controllers\Banking;

use App\Models\TransactionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = TransactionCategory::where('user_id', $request->user()->id)->get();

        return Inertia::render('categories/index', [
            'categories' => $categories->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'color' => $cat->color,
                'icon' => $cat->icon,
                'transaction_count' => $cat->transactions()->count(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon' => ['nullable', 'string'],
        ]);

        $request->user()->transactionCategories()->create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Category created successfully.',
        ]);

        return back();
    }
}
