<?php
namespace Tests\Feature\Security;
use App\Mail\OtpVerificationMail;
use App\Models\Account;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
class OtpVerificationTest extends TestCase { use RefreshDatabase;
    public function test_correct_password_requires_otp_before_login(): void { Mail::fake(); $user = User::factory()->create(); $this->post(route('login.store'), ['email'=>$user->email,'password'=>'password'])->assertRedirect(route('security.login.show')); $this->assertGuest(); $this->assertDatabaseHas('otp_verifications',['user_id'=>$user->id,'purpose'=>'login','status'=>'pending']); }
    public function test_correct_otp_completes_login_and_cannot_be_reused(): void { Mail::fake(); $user=User::factory()->create(); $this->post(route('login.store'),['email'=>$user->email,'password'=>'password']); $mail=null; Mail::assertSent(OtpVerificationMail::class,function($sent) use (&$mail){$mail=$sent;return true;}); $this->post(route('security.login.verify'),['code'=>$mail->code])->assertRedirect('/dashboard'); $this->assertAuthenticatedAs($user); $this->post(route('security.login.verify'),['code'=>$mail->code])->assertRedirect('/dashboard'); }
    public function test_transfer_does_not_change_balance_until_otp_is_verified(): void { Mail::fake(); $user=User::factory()->create(); $source=Account::factory()->for($user)->create(['balance'=>'100.00']); $destination=Account::factory()->for($user)->create(['balance'=>'0.00']); $this->actingAs($user)->post(route('transfers.store'),['transfer_type'=>'internal','source_account_id'=>$source->id,'destination_account_id'=>$destination->id,'amount'=>'25.00'])->assertRedirect(route('security.transaction.show')); $this->assertDatabaseHas('accounts',['id'=>$source->id,'balance'=>'100.00']); $this->assertDatabaseCount('transfers',0); }
}
