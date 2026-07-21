import { Form, Head } from '@inertiajs/react';
import { Landmark, Plus, Repeat2, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, maskAccountNumber } from '@/lib/money';

type Account = { id: number; name: string; account_number: string; balance: string; currency: string };
type Transfer = {
    id: number;
    transfer_type: 'internal' | 'domestic' | 'wire';
    status: 'pending' | 'completed' | 'failed';
    amount: string;
    currency: string;
    source_account_name: string;
    destination_name: string | null;
    bank_name: string | null;
    description: string | null;
    created_at: string | null;
};
type Props = { accounts: Account[]; transfers: Transfer[] };

const statusVariant: Record<Transfer['status'], 'default' | 'secondary' | 'destructive'> = {
    completed: 'default', pending: 'secondary', failed: 'destructive',
};

export default function Transfers({ accounts, transfers }: Props) {
    const [transferType, setTransferType] = useState<Transfer['transfer_type']>('internal');

    return <>
        <Head title="Transfers" />
        <div className="space-y-6">
            <div><h1 className="text-2xl font-semibold tracking-tight">Money transfers</h1><p className="mt-1 text-sm text-muted-foreground">Move funds between your accounts or send payments to other banks.</p></div>
            <Card className="border shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Send className="size-5 text-brand" /> Send money</CardTitle><CardDescription>Internal transfers are immediate. Domestic and wire transfers are recorded with their bank details.</CardDescription></CardHeader>
                <CardContent>
                    <Form action="/transfers" method="post" className="grid gap-4 sm:grid-cols-2">
                        {({ processing, errors }) => <>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="transfer_type">Transfer type</Label>
                                <select id="transfer_type" name="transfer_type" value={transferType} onChange={(event) => setTransferType(event.target.value as Transfer['transfer_type'])} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="internal">Internal — my Blitz accounts</option><option value="domestic">Domestic — another bank</option><option value="wire">Wire — international</option>
                                </select>
                                <InputError message={errors.transfer_type} />
                            </div>
                            <div className="grid gap-2"><Label htmlFor="source_account_id">From account</Label><select id="source_account_id" name="source_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} — {formatCurrency(account.balance, account.currency)}</option>)}</select><InputError message={errors.source_account_id} /></div>
                            <div className="grid gap-2"><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /><InputError message={errors.amount} /></div>
                            {transferType === 'internal' && <div className="grid gap-2 sm:col-span-2"><Label htmlFor="destination_account_id">To account</Label><select id="destination_account_id" name="destination_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} — {maskAccountNumber(account.account_number)}</option>)}</select><InputError message={errors.destination_account_id} /></div>}
                            {transferType === 'domestic' && <><Field name="recipient_name" label="Recipient name" error={errors.recipient_name} /><Field name="bank_name" label="Bank name" error={errors.bank_name} /><Field name="recipient_account_number" label="Recipient account number" error={errors.recipient_account_number} className="sm:col-span-2" /></>}
                            {transferType === 'wire' && <><Field name="recipient_name" label="Recipient name" error={errors.recipient_name} /><Field name="wire_bank_name" label="Recipient bank" error={errors.wire_bank_name} /><Field name="swift_bic" label="SWIFT / BIC" error={errors.swift_bic} placeholder="DEUTDEFF" /><Field name="iban" label="IBAN" error={errors.iban} placeholder="DE89370400440532013000" /></>}
                            <Field name="description" label="Reference / memo" error={errors.description} placeholder="Optional reference" className="sm:col-span-2" required={false} />
                            <div className="flex items-center justify-between gap-4 sm:col-span-2"><p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4" /> Your balance is checked before the transfer is recorded.</p><Button type="submit" disabled={processing || accounts.length === 0}><Plus className="size-4" />{processing ? 'Sending…' : 'Send transfer'}</Button></div>
                        </>}
                    </Form>
                </CardContent>
            </Card>
            <Card className="border shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Repeat2 className="size-5 text-brand" /> Transfer history</CardTitle><CardDescription>Your 50 most recent internal, domestic, and wire transfers.</CardDescription></CardHeader>
                <CardContent>{transfers.length === 0 ? <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">No transfers have been sent yet.</div> : <div className="grid gap-3">{transfers.map((transfer) => <div key={transfer.id} className="rounded-2xl border border-border p-4"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Landmark className="size-4 text-brand" /><p className="font-medium capitalize">{transfer.transfer_type} transfer to {transfer.destination_name ?? 'recipient'}</p><Badge variant={statusVariant[transfer.status]} className="capitalize">{transfer.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">From {transfer.source_account_name}{transfer.bank_name ? ` · ${transfer.bank_name}` : ''}{transfer.description ? ` · ${transfer.description}` : ''}</p>{transfer.created_at && <p className="mt-1 text-xs text-muted-foreground">Initiated {new Date(transfer.created_at).toLocaleString()}</p>}</div><p className="shrink-0 font-semibold tabular-nums">{formatCurrency(transfer.amount, transfer.currency)}</p></div></div>)}</div>}</CardContent>
            </Card>
        </div>
    </>;
}

function Field({ name, label, error, placeholder, className = '', required = true }: { name: string; label: string; error?: string; placeholder?: string; className?: string; required?: boolean }) {
    return <div className={`grid gap-2 ${className}`}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} placeholder={placeholder} required={required} /><InputError message={error} /></div>;
}

Transfers.layout = { breadcrumbs: [{ title: 'Transfers', href: '/transfers' }] };
