<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BeneficiaryController extends Controller
{
    public function destroy(Request $request, Beneficiary $beneficiary): RedirectResponse
    {
        abort_unless($beneficiary->user_id === $request->user()->id, 403);

        $beneficiary->delete();

        return back();
    }
}
