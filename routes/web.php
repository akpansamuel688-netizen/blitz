<?php

use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Banking\AccountController;
use App\Http\Controllers\Banking\BillController;
use App\Http\Controllers\Banking\BudgetController;
use App\Http\Controllers\Banking\CategoryController;
use App\Http\Controllers\Banking\DashboardController;
use App\Http\Controllers\Banking\RecurringTransferController;
use App\Http\Controllers\Banking\SavingsGoalController;
use App\Http\Controllers\Banking\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::get('accounts/{account}', [AccountController::class, 'show'])->name('accounts.show');
    Route::post('accounts/{account}/transfer', [AccountController::class, 'transfer'])->name('accounts.transfer');

    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');

    Route::get('bills', [BillController::class, 'index'])->name('bills.index');
    Route::post('bills', [BillController::class, 'store'])->name('bills.store');

    Route::get('budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::post('budgets', [BudgetController::class, 'store'])->name('budgets.store');

    Route::get('recurring-transfers', [RecurringTransferController::class, 'index'])->name('recurring-transfers.index');
    Route::post('recurring-transfers', [RecurringTransferController::class, 'store'])->name('recurring-transfers.store');

    Route::get('savings-goals', [SavingsGoalController::class, 'index'])->name('savings-goals.index');
    Route::post('savings-goals', [SavingsGoalController::class, 'store'])->name('savings-goals.store');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::get('/accounts', [AdminAccountController::class, 'index'])->name('accounts.index');
    });
});

require __DIR__.'/settings.php';
