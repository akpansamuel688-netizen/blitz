import { Form, Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDateTime } from '@/lib/money';
import TransferLedger from '@/components/admin/transfer-ledger';
import TransferLedgerEditor from '@/components/admin/transfer-ledger-editor';

type Transfer = { id: number; type: string; status: string; amount: string; fee: string; currency: string; customer: string; customer_email: string; source_account: string; recipient: string | null; bank_name: string | null; description: string | null; created_at: string | null };
type Props = { transfers: { data: Transfer[]; links: Array<{ url: string | null; label: string; active: boolean }>; total: number }; filters: { status: string; type: string } };

function LegacyAdminTransfers({ transfers, filters }: Props) {
    const [status, setStatus] = useState(filters.status);
    const [type, setType] = useState(filters.type);
    function filter(event: FormEvent) { event.preventDefault(); router.get('/admin/transfers', { status: status || undefined, type: type || undefined }, { preserveState: true, replace: true }); }
    return <><Head title="Admin · Transfers" /><div className="space-y-6"><div><h1 className="text-2xl font-semibold">Transfer ledger</h1><p className="mt-1 text-sm text-muted-foreground">Review all platform transfers, fees, customers, and destinations.</p></div><form onSubmit={filter} className="flex flex-wrap gap-2"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select><select value={type} onChange={(event) => setType(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">All types</option><option value="internal">Internal</option><option value="domestic">Domestic</option><option value="wire">Wire</option></select><Button type="submit">Filter</Button></form><Card><CardHeader><CardTitle>Transfers</CardTitle><CardDescription>{transfers.total} records</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3">Customer</th><th className="pb-3">Route</th><th className="pb-3">Status</th><th className="pb-3">Created</th><th className="pb-3 text-right">Amount</th><th className="pb-3 text-right">Fee</th></tr></thead><tbody className="divide-y">{transfers.data.map((transfer) => <tr key={transfer.id}><td className="py-3"><p className="font-medium">{transfer.customer}</p><p className="text-xs text-muted-foreground">{transfer.customer_email}</p></td><td className="py-3"><p className="capitalize">{transfer.type}: {transfer.source_account} → {transfer.recipient ?? 'Recipient'}</p><p className="text-xs text-muted-foreground">{transfer.bank_name ?? ''}</p></td><td className="py-3"><Badge variant={transfer.status === 'failed' ? 'destructive' : transfer.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{transfer.status}</Badge></td><td className="py-3 text-muted-foreground">{formatDateTime(transfer.created_at)}</td><td className="py-3 text-right font-medium">{formatCurrency(transfer.amount, transfer.currency)}</td><td className="py-3 text-right">{formatCurrency(transfer.fee, transfer.currency)}</td></tr>)}</tbody></table></div>{transfers.data.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No transfers match these filters.</p>}<div className="mt-5 flex flex-wrap gap-2">{transfers.links.map((link, index) => <Button key={index} size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url} onClick={() => link.url && router.get(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div></CardContent></Card></div></>;
}

export default function AdminTransfers({ transfers, filters }: Props) {
    return <><Head title="Admin · Transfers" /><TransferLedgerEditor transfers={transfers} filters={filters} /></>;
}

AdminTransfers.layout = { breadcrumbs: [{ title: 'Admin', href: '/admin' }, { title: 'Transfers', href: '/admin/transfers' }] };
