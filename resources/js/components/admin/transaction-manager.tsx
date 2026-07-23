import { Form, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDateTime } from '@/lib/money';

type Customer = { id: number; name: string; email: string; accounts_count: number };
type Transaction = { id: number; type: string; amount: string; description: string | null; account_name: string; status: string; is_transfer_linked?: boolean; created_at: string | null };

function LegacyTransactionManager({ customers, transactions }: { customers: Customer[]; transactions: Transaction[] }) {
    return <div className="space-y-6">
        <div><h1 className="text-2xl font-semibold">Transaction manager</h1><p className="mt-1 text-sm text-muted-foreground">Generate dated ledger activity for one or more customers and edit transaction descriptions.</p></div>
        <Card>
            <CardHeader><CardTitle>Generate transactions</CardTitle><CardDescription>Choose one or more customers. The batch is applied to every account they own, with automatic payment descriptions and timestamps.</CardDescription></CardHeader>
            <CardContent>
                <Form action="/admin/transactions/generate" method="post" className="grid gap-4 sm:grid-cols-2">{({ processing, errors }) => <>
                    <div className="grid gap-2 sm:col-span-2"><Label htmlFor="user_ids">Customers</Label><select id="user_ids" name="user_ids[]" multiple required size={Math.min(Math.max(customers.length, 3), 8)} className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm">{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email} ({customer.accounts_count} {customer.accounts_count === 1 ? 'account' : 'accounts'})</option>)}</select><p className="text-xs text-muted-foreground">Hold Ctrl (Windows) or ⌘ (Mac) to select multiple customers.</p><p className="text-xs text-destructive">{errors.user_ids}</p></div>
                    <div className="grid gap-2"><Label>Transaction amount range (USD)</Label><div className="grid grid-cols-2 gap-2"><Input name="min_amount" type="number" min="1" max="100000" step="0.01" defaultValue="1.00" required placeholder="Minimum" aria-label="Minimum amount" /><Input name="max_amount" type="number" min="1" max="100000" step="0.01" defaultValue="100000.00" required placeholder="Maximum" aria-label="Maximum amount" /></div><p className="text-xs text-muted-foreground">A different random amount from $1.00 to $100,000.00 is created for each transaction.</p><p className="text-xs text-destructive">{errors.min_amount ?? errors.max_amount}</p></div>
                    <div className="grid gap-2"><Label htmlFor="transaction_type">Type</Label><select id="transaction_type" name="transaction_type" className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="Credit">Credit</option><option value="Debit">Debit</option></select></div>
                    <Field name="count" label="Transactions per account (1–100)" type="number" defaultValue="10" />
                    <Field name="start_date" label="Start date" type="date" />
                    <Field name="end_date" label="End date" type="date" />
                    <div className="flex items-end"><Button disabled={processing}>Generate transactions</Button></div>
                </>}</Form>
            </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Recent ledger activity</CardTitle></CardHeader><CardContent><div className="grid gap-3">{transactions.map((transaction) => <div key={transaction.id} className="rounded-xl border p-3"><div className="flex justify-between gap-4"><div><p className="font-medium">{transaction.description ?? 'Transaction'}</p><p className="text-sm text-muted-foreground">{transaction.type} · {transaction.account_name} · {transaction.status} · {formatDateTime(transaction.created_at)}</p></div><p className="font-semibold">{formatCurrency(transaction.amount)}</p></div><div className="mt-3"><Button size="sm" variant="outline" asChild><Link href={`/admin/transactions/${transaction.id}`}>View & edit</Link></Button></div></div>)}</div></CardContent></Card>
    </div>;
}

function Field({ name, label, type = 'text', defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) { return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} step={type === 'number' ? '0.01' : undefined} min={type === 'number' ? '0' : undefined} defaultValue={defaultValue} required /></div>; }

function LedgerDeleteActions({ transactions }: { transactions: Transaction[] }) { const deletable = transactions.filter((transaction) => !transaction.is_transfer_linked); return deletable.length === 0 ? null : <Card><CardHeader><CardTitle>Remove ledger activity</CardTitle><CardDescription>Deleting a completed entry reverses its balance effect and removes it from the customer's history.</CardDescription></CardHeader><CardContent><div className="grid gap-2">{deletable.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{transaction.description ?? 'Transaction'}</p><p className="text-xs text-muted-foreground">{transaction.type} - {transaction.account_name} - {formatCurrency(transaction.amount)}</p></div><Form action={`/admin/transactions/${transaction.id}`} method="delete" onSubmit={(event) => { if (!window.confirm('Delete this transaction? Its effect will be reversed from the account balance.')) event.preventDefault(); }}>{({ processing }) => <Button size="sm" variant="destructive" disabled={processing}>Delete</Button>}</Form></div>)}</div></CardContent></Card>; }

// Legacy transaction manager ends above.

export default function TransactionManager({ customers, transactions }: { customers: Customer[]; transactions: Transaction[] }) {
    return <div className="space-y-6">
        <div><h1 className="text-2xl font-semibold">Transaction manager</h1><p className="mt-1 text-sm text-muted-foreground">Generate dated ledger activity for one or more customers and edit transaction descriptions.</p></div>
        <Card>
            <CardHeader><CardTitle>Generate transactions</CardTitle><CardDescription>Click the customer cards to select one or more recipients. The batch is applied to every account they own.</CardDescription></CardHeader>
            <CardContent>
                <Form action="/admin/transactions/generate" method="post" className="grid gap-4 sm:grid-cols-2">{({ processing, errors }) => <>
                    <fieldset className="grid gap-2 sm:col-span-2"><legend className="text-sm font-medium">Customers</legend><div className="grid gap-2 sm:grid-cols-2">{customers.map((customer) => <label key={customer.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-muted"><input type="checkbox" name="user_ids[]" value={customer.id} className="size-4 accent-primary" /><span className="min-w-0"><span className="block truncate font-medium">{customer.name}</span><span className="block truncate text-xs text-muted-foreground">{customer.email} · {customer.accounts_count} {customer.accounts_count === 1 ? 'account' : 'accounts'}</span></span></label>)}</div><p className="text-xs text-destructive">{errors.user_ids}</p></fieldset>
                    <div className="grid gap-2"><Label>Transaction amount range (USD)</Label><div className="grid grid-cols-2 gap-2"><Input name="min_amount" type="number" min="1" max="100000" step="0.01" defaultValue="1.00" required placeholder="Minimum" aria-label="Minimum amount" /><Input name="max_amount" type="number" min="1" max="100000" step="0.01" defaultValue="100000.00" required placeholder="Maximum" aria-label="Maximum amount" /></div><p className="text-xs text-muted-foreground">Each transaction receives a different random amount from $1.00 to $100,000.00.</p><p className="text-xs text-destructive">{errors.min_amount ?? errors.max_amount}</p></div>
                    <div className="grid gap-2"><Label htmlFor="transaction_type">Type</Label><select id="transaction_type" name="transaction_type" className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="Credit">Credit</option><option value="Debit">Debit</option></select></div>
                    <Field name="count" label="Transactions per account (1–100)" type="number" defaultValue="10" />
                    <Field name="start_date" label="Start date" type="date" />
                    <Field name="end_date" label="End date" type="date" />
                    <div className="flex items-end"><Button disabled={processing}>Generate transactions</Button></div>
                </>}</Form>
            </CardContent>
        </Card>
        <LedgerDeleteActions transactions={transactions} />
        <Card><CardHeader><CardTitle>Recent ledger activity</CardTitle></CardHeader><CardContent><div className="grid gap-3">{transactions.map((transaction) => <div key={transaction.id} className="rounded-xl border p-3"><div className="flex justify-between gap-4"><div><p className="font-medium">{transaction.description ?? 'Transaction'}</p><p className="text-sm text-muted-foreground">{transaction.type} · {transaction.account_name} · {formatDateTime(transaction.created_at)}</p></div><p className="font-semibold">{formatCurrency(transaction.amount)}</p></div><Form action={`/admin/transactions/${transaction.id}`} method="patch" className="mt-3 flex gap-2">{({ processing }) => <><Input name="description" defaultValue={transaction.description ?? ''} aria-label="Transaction description" /><Button size="sm" variant="outline" disabled={processing}>Save</Button></>}</Form></div>)}</div></CardContent></Card>
    </div>;
}
