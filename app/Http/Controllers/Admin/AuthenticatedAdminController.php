<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedAdminController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::user()?->isAdmin()) {
            return to_route('admin.dashboard');
        }

        return Inertia::render('auth/admin-login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }

        $request->session()->regenerate();

        if (! Auth::user()?->isAdmin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages(['email' => 'This account is not authorized for administrator access.']);
        }

        return redirect()->intended(route('admin.dashboard'));
    }
}
