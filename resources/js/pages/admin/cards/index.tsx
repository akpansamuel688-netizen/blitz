import { Form, Head, Link } from '@inertiajs/react';
import { CheckCircle2, CreditCard, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, maskAccountNumber } from '@/lib/money';
import admin from '@/routes/admin';

type Request = { id: number; customer_name: string; customer_email: string; account_name: string; account_number: string; requested_at: string | null };
type Props = { requests: Request[] };

export default function AdminCardRequests({ requests }: Props) {
    return <>
        <Head title="Admin - Card requests" />
        <div className="space-y-6">
            <div><h1 className="text-2xl font-semibold tracking-tight">Physical debit card requests</h1><p className="mt-1 text-sm text-muted-foreground">Review customer requests before a physical debit card is issued.</p></div>
            <Card className="border shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5 text-brand" /> Pending requests</CardTitle><CardDescription>{requests.length} physical card request{requests.length === 1 ? '' : 's'} awaiting a decision.</CardDescription></CardHeader><CardContent>{requests.length === 0 ? <div className="rounded-xl border border-dashed px-5 py-12 text-center text-sm text-muted-foreground">There are no physical debit card requests to review.</div> : <div className="grid gap-3">{requests.map((request) => <div key={request.id} className="rounded-xl border p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-medium">{request.customer_name}</p><p className="mt-1 text-sm text-muted-foreground">{request.customer_email} - {request.account_name} ({maskAccountNumber(request.account_number)})</p><p className="mt-1 text-xs text-muted-foreground">Requested {request.requested_at ? formatDateTime(request.requested_at) : '-'}</p></div><div className="flex gap-2"><Form action={`/admin/cards/${request.id}/reject`} method="patch" onSubmit={(event) => { if (!window.confirm('Reject this physical card request?')) event.preventDefault(); }}>{({ processing }) => <Button type="submit" variant="outline" className="text-destructive hover:text-destructive" disabled={processing}><XCircle className="size-4" /> Reject</Button>}</Form><Form action={`/admin/cards/${request.id}/approve`} method="patch" onSubmit={(event) => { if (!window.confirm('Approve and issue this physical debit card?')) event.preventDefault(); }}>{({ processing }) => <Button type="submit" disabled={processing}><CheckCircle2 className="size-4" /> Approve</Button>}</Form></div></div></div>)}</div>}</CardContent></Card>
        </div>
    </>;
}

AdminCardRequests.layout = { breadcrumbs: [{ title: 'Admin', href: admin.dashboard() }, { title: 'Card requests', href: '/admin/cards' }] };
