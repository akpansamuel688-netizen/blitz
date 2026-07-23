<?php

use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\AuthenticatedAdminController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\TransferController as AdminTransferController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Banking\AccountController;
use App\Http\Controllers\Banking\BillController;
use App\Http\Controllers\Banking\BeneficiaryController;
use App\Http\Controllers\Banking\BudgetController;
use App\Http\Controllers\Banking\CategoryController;
use App\Http\Controllers\Banking\DashboardController;
use App\Http\Controllers\Banking\RecurringTransferController;
use App\Http\Controllers\Banking\SavingsGoalController;
use App\Http\Controllers\Banking\TransactionController;
use App\Http\Controllers\Banking\TransferController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('admin/login', [AuthenticatedAdminController::class, 'create'])->name('admin.login');
Route::post('admin/login', [AuthenticatedAdminController::class, 'store'])->name('admin.login.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::get('accounts/{account}', [AccountController::class, 'show'])->name('accounts.show');
    Route::post('accounts/{account}/transfer', [AccountController::class, 'transfer'])->name('accounts.transfer');

    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::patch('transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');

    Route::get('transfers', [TransferController::class, 'index'])->name('transfers.index');
    Route::post('transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::patch('transfers/{transfer}', [TransferController::class, 'update'])->name('transfers.update');
    Route::delete('beneficiaries/{beneficiary}', [BeneficiaryController::class, 'destroy'])->name('beneficiaries.destroy');

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

});

Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('/users', [AdminUserController::class, 'storeCustomer'])->name('users.store');
    Route::post('/users/test-users', [AdminUserController::class, 'storeTestUsers'])->name('users.test-users.store');
    Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/accounts/{account}/balance', [AdminUserController::class, 'updateAccountBalance'])->name('users.accounts.balance.update');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::get('/accounts', [AdminAccountController::class, 'index'])->name('accounts.index');
    Route::get('/transfers', [AdminTransferController::class, 'index'])->name('transfers.index');
    Route::patch('/transfers/{transfer}', [AdminTransferController::class, 'update'])->name('transfers.update');
    Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
    Route::patch('/transactions/{transaction}', [AdminTransactionController::class, 'update'])->name('transactions.update');
    Route::post('/transactions/generate', [AdminTransactionController::class, 'generate'])->name('transactions.generate');
});

require __DIR__.'/settings.php';
