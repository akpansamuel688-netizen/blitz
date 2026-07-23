import { Form, Head, router } from '@inertiajs/react';
import { CheckCircle2, Landmark, Plus, Repeat2, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, maskAccountNumber } from '@/lib/money';

type Account = { id: number; name: string; account_number: string; balance: string; currency: string };
type Transfer = {
    id: number;
    transfer_type: 'internal' | 'domestic' | 'wire';
    status: 'pending' | 'completed' | 'failed';
    amount: string;
    fee_amount: string;
    currency: string;
    source_account_name: string;
    destination_name: string | null;
    bank_name: string | null;
    description: string | null;
    created_at: string | null;
};
type Beneficiary = { id: number; transfer_type: 'domestic' | 'wire'; name: string; bank_name: string | null };
type Receipt = { type: string; amount: string; fee: string };
type Props = { accounts: Account[]; transfers: Transfer[]; beneficiaries: Beneficiary[]; dailyLimit: string; dailyRemaining: string };

const statusVariant: Record<Transfer['status'], 'default' | 'secondary' | 'destructive'> = {
    completed: 'default', pending: 'secondary', failed: 'destructive',
};

export default function Transfers({ accounts, transfers, beneficiaries, dailyLimit, dailyRemaining }: Props) {
    const [transferType, setTransferType] = useState<Transfer['transfer_type']>('internal');
    const [confirmation, setConfirmation] = useState(false);
    const [pendingReceipt, setPendingReceipt] = useState<Receipt | null>(null);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const review = () => {
        const form = document.getElementById('transfer-form') as HTMLFormElement | null;
        if (!form?.reportValidity()) return;
        const data = new FormData(form);
        const amount = Number(data.get('amount'));
        setPendingReceipt({ type: String(data.get('transfer_type')), amount: String(data.get('amount')), fee: (Math.round(amount * 0.8) / 100).toFixed(2) });
        setConfirmation(true);
    };

    return <>
        <Head title="Transfers" />
        <div className="space-y-6">
            <div><h1 className="text-2xl font-semibold tracking-tight">Money transfers</h1><p className="mt-1 text-sm text-muted-foreground">Move funds between your accounts or send payments to other banks.</p><p className="mt-2 text-sm text-muted-foreground">Daily limit: {formatCurrency(dailyLimit)} · Remaining today: {formatCurrency(dailyRemaining)}</p></div>
            <Card className="border shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Send className="size-5 text-brand" /> Send money</CardTitle><CardDescription>Internal transfers are immediate. Domestic and wire transfers are recorded with their bank details.</CardDescription></CardHeader>
                <CardContent>
                    <Form id="transfer-form" action="/transfers" method="post" className="grid gap-4 sm:grid-cols-2" onSuccess={() => { setConfirmation(false); setReceipt(pendingReceipt); }}>
                        {({ processing, errors }) => <>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="transfer_type">Transfer type</Label>
                                <select id="transfer_type" name="transfer_type" value={transferType} onChange={(event) => setTransferType(event.target.value as Transfer['transfer_type'])} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="internal">Internal</option><option value="domestic">Domestic</option><option value="wire">Wire — international</option>
                                </select>
                                <InputError message={errors.transfer_type} />
                            </div>
                            <div className="grid gap-2"><Label htmlFor="source_account_id">From account</Label><select id="source_account_id" name="source_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} — {formatCurrency(account.balance, account.currency)}</option>)}</select><InputError message={errors.source_account_id} /></div>
                            <div className="grid gap-2"><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /><InputError message={errors.amount} /></div>
                            {transferType === 'internal' && <div className="grid gap-2 sm:col-span-2"><Label htmlFor="destination_account_id">To account</Label><select id="destination_account_id" name="destination_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} — {maskAccountNumber(account.account_number)}</option>)}</select><InputError message={errors.destination_account_id} /></div>}
                            {transferType !== 'internal' && <div className="grid gap-2 sm:col-span-2"><Label htmlFor="beneficiary_id">Saved recipient (optional)</Label><select id="beneficiary_id" name="beneficiary_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Enter a new recipient</option>{beneficiaries.filter((beneficiary) => beneficiary.transfer_type === transferType).map((beneficiary) => <option key={beneficiary.id} value={beneficiary.id}>{beneficiary.name} — {beneficiary.bank_name ?? 'Bank'}</option>)}</select><InputError message={errors.beneficiary_id} /></div>}
                            {transferType === 'domestic' && <><Field name="recipient_name" label="Recipient name" error={errors.recipient_name} required={false} /><Field name="bank_name" label="Bank name" error={errors.bank_name} required={false} /><Field name="recipient_account_number" label="Recipient account number" error={errors.recipient_account_number} className="sm:col-span-2" required={false} /></>}
                            {transferType === 'wire' && <><Field name="recipient_name" label="Recipient name" error={errors.recipient_name} required={false} /><Field name="wire_bank_name" label="Recipient bank" error={errors.wire_bank_name} required={false} /><Field name="swift_bic" label="SWIFT / BIC" error={errors.swift_bic} placeholder="DEUTDEFF" required={false} /><Field name="iban" label="IBAN" error={errors.iban} placeholder="DE89370400440532013000" required={false} /></>}
                            <Field name="description" label="Reference / description" error={errors.description} placeholder="Optional reference" className="sm:col-span-2" required={false} />
                            {transferType !== 'internal' && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input name="save_beneficiary" type="checkbox" value="1" /> Save this recipient for future transfers</label>}
                            <div className="grid gap-2"><Label>Transfer fee</Label><div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm">0.8% of transfer amount</div><p className="text-xs text-muted-foreground">Calculated automatically and included in the total debit.</p></div>
                            <div className="flex items-end"><Button type="button" className="w-full" disabled={processing || accounts.length === 0} onClick={review}><ShieldCheck className="size-4" /> Review transfer</Button></div>
                        </>}
                    </Form>
                </CardContent>
            </Card>
            {beneficiaries.length > 0 && <Card className="border shadow-sm"><CardHeader><CardTitle>Saved recipients</CardTitle><CardDescription>Recipients saved from your domestic and wire transfers.</CardDescription></CardHeader><CardContent><div className="grid gap-2">{beneficiaries.map((beneficiary) => <div key={beneficiary.id} className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>{beneficiary.name} · {beneficiary.bank_name ?? 'Bank'}</span><Button variant="ghost" size="sm" onClick={() => router.delete(`/beneficiaries/${beneficiary.id}`)}>Remove</Button></div>)}</div></CardContent></Card>}
            <Card className="border shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Repeat2 className="size-5 text-brand" /> Transfer history</CardTitle><CardDescription>Your 50 most recent internal, domestic, and wire transfers.</CardDescription></CardHeader>
                <CardContent>{transfers.length === 0 ? <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">No transfers have been sent yet.</div> : <div className="grid gap-3">{transfers.map((transfer) => <div key={transfer.id} className="rounded-2xl border border-border p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Landmark className="size-4 text-brand" /><p className="font-medium capitalize">{transfer.transfer_type} transfer to {transfer.destination_name ?? 'recipient'}</p><Badge variant={statusVariant[transfer.status]} className="capitalize">{transfer.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">From {transfer.source_account_name}{transfer.bank_name ? ` · ${transfer.bank_name}` : ''}{transfer.description ? ` · ${transfer.description}` : ''}</p>{transfer.created_at && <p className="mt-1 text-xs text-muted-foreground">Initiated {new Date(transfer.created_at).toLocaleString()}</p>}</div><p className="shrink-0 font-semibold tabular-nums">{formatCurrency(transfer.amount, transfer.currency)}</p></div></div>)}</div>}</CardContent>
            </Card>
        </div>
        <Dialog open={confirmation} onOpenChange={setConfirmation}><DialogContent><DialogHeader><DialogTitle>Confirm transfer</DialogTitle><DialogDescription>Check the total debit before sending.</DialogDescription></DialogHeader><ReceiptDetails receipt={pendingReceipt} /><DialogFooter><Button variant="outline" onClick={() => setConfirmation(false)}>Edit</Button><Button type="submit" form="transfer-form">Confirm and send</Button></DialogFooter></DialogContent></Dialog>
        <Dialog open={receipt !== null} onOpenChange={(open) => !open && setReceipt(null)}><DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> Transfer successful</DialogTitle><DialogDescription>Your transfer has been recorded.</DialogDescription></DialogHeader><ReceiptDetails receipt={receipt} /><DialogFooter><Button onClick={() => setReceipt(null)}>Done</Button></DialogFooter></DialogContent></Dialog>
    </>;
}

function ReceiptDetails({ receipt }: { receipt: Receipt | null }) {
    return receipt && <div className="rounded-xl bg-muted p-4 text-sm"><p className="capitalize">{receipt.type} transfer</p><p>Amount: {formatCurrency(receipt.amount)}</p><p>Fee: {formatCurrency(receipt.fee)}</p><p className="font-medium">Total debit: {formatCurrency(Number(receipt.amount) + Number(receipt.fee))}</p></div>;
}

function Field({ name, label, error, placeholder, type = 'text', defaultValue, className = '', required = true }: { name: string; label: string; error?: string; placeholder?: string; type?: string; defaultValue?: string; className?: string; required?: boolean }) {
    return <div className={`grid gap-2 ${className}`}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined} placeholder={placeholder} defaultValue={defaultValue} required={required} /><InputError message={error} /></div>;
}

Transfers.layout = { breadcrumbs: [{ title: 'Transfers', href: '/transfers' }] };
