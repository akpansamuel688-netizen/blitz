import { Form, Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = { flow: 'login' | 'transaction'; maskedEmail: string; expiresAt: string; attemptsRemaining: number; transaction?: { type: string; amount: string; from: string; to: string } };
export default function OtpVerification({ flow, maskedEmail, expiresAt, attemptsRemaining, transaction }: Props) {
    const [remaining, setRemaining] = useState(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    useEffect(() => { const timer = window.setInterval(() => setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))), 1000); return () => window.clearInterval(timer); }, [expiresAt]);
    const clock = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);
    const base = flow === 'login' ? '/security/login-verification' : '/security/transaction-verification';
    return <><Head title="Security verification" /><div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm"><div className="space-y-2"><p className="text-sm font-medium text-primary">NovaTrust Bank Security</p><h1 className="text-2xl font-semibold">Verify it’s you</h1><p className="text-sm text-muted-foreground">We sent a six-digit verification code to {maskedEmail}.</p></div>{transaction && <div className="rounded-xl border bg-muted/40 p-4 text-sm"><p className="font-medium">{transaction.type}</p><p className="mt-1">Amount: ${transaction.amount}</p><p>From: {transaction.from} · To: {transaction.to}</p></div>}<Form action={base} method="post" className="space-y-4">{({ errors, processing }) => <><div className="space-y-2"><Label htmlFor="code">Verification code</Label><Input id="code" name="code" inputMode="numeric" pattern="[0-9]*" autoFocus autoComplete="one-time-code" maxLength={6} className="h-12 text-center text-xl tracking-[0.45em]" placeholder="000000" required onChange={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 6); }} /><InputError message={errors.code} /></div><p className="text-xs text-muted-foreground">Code expires in {clock}. {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining.</p><Button className="w-full" disabled={processing || remaining === 0}>{processing && <Spinner />}Verify code</Button></>}</Form><Form action={`${base}/resend`} method="post">{({ processing, errors }) => <><InputError message={errors.otp} /><Button variant="outline" className="w-full" disabled={processing}> {processing && <Spinner />}Resend code</Button></>}</Form></div></>;
}
OtpVerification.layout = { title: 'Security verification', description: 'Enter the code sent to your registered email address' };
