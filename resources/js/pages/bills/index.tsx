import { Form, Head } from '@inertiajs/react';
import { Calendar, Plus, Receipt } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import bills from '@/routes/bills';

type Bill = {
    id: number;
    name: string;
    amount: string;
    frequency: string;
    next_due_date: string | null;
    status: string;
    category?: string | null;
    auto_pay: boolean;
    account_name: string;
};

type Props = {
    bills: Bill[];
    accounts: Array<{ id: number; name: string }>;
};

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    overdue: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export default function Bills({ bills: billItems, accounts }: Props) {
    const overdueBills = billItems.filter((b) => b.status === 'overdue');
    const totalMonthly = billItems
        .filter((b) => b.frequency === 'monthly')
        .reduce((sum, b) => sum + Number(b.amount), 0);

    return (
        <>
            <Head title="Bills & payments" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Bills & payments</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Track due dates, monthly obligations, and autopay readiness.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total bills</CardDescription>
                            <CardTitle className="text-2xl">{billItems.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Overdue</CardDescription>
                            <CardTitle
                                className={cn(
                                    'text-2xl',
                                    overdueBills.length > 0 ? 'text-rose-600' : 'text-brand',
                                )}
                            >
                                {overdueBills.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border border-brand/15 bg-gradient-to-br from-brand-subtle to-card shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Monthly bill load</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(totalMonthly)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Add bill</CardTitle>
                        <CardDescription>Create a payment reminder for an account you own.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...bills.store.form()} className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Bill name</Label>
                                        <Input id="name" name="name" placeholder="Electric bill" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
                                        <InputError message={errors.amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <select id="frequency" name="frequency" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="annually">Annually</option>
                                        </select>
                                        <InputError message={errors.frequency} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="next_due_date">Next due date</Label>
                                        <Input id="next_due_date" name="next_due_date" type="date" required />
                                        <InputError message={errors.next_due_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_id">Pay from</Label>
                                        <select id="account_id" name="account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="">Select account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input id="category" name="category" placeholder="Utilities" />
                                        <InputError message={errors.category} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing || accounts.length === 0}>
                                            <Plus className="size-4" />
                                            Add bill
                                        </Button>
                                    </div>
                                    {accounts.length === 0 && (
                                        <p className="sm:col-span-2 text-sm text-muted-foreground">
                                            Open an account first before adding bills.
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="size-5 text-brand" />
                            Your bills
                        </CardTitle>
                        <CardDescription>Upcoming and overdue obligations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {billItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No bills yet. Add one to start tracking payments.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {billItems.map((bill) => (
                                    <div key={bill.id} className="rounded-2xl border border-border p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">{bill.name}</p>
                                                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[bill.status] ?? 'bg-muted')}>
                                                        {bill.status}
                                                    </span>
                                                    {bill.auto_pay && <Badge variant="secondary">Auto-pay</Badge>}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {bill.account_name}
                                                    {bill.category ? ` · ${bill.category}` : ''}
                                                    {` · ${bill.frequency}`}
                                                </p>
                                            </div>
                                            <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(bill.amount)}</p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="size-4" />
                                            Due {bill.next_due_date ? new Date(bill.next_due_date).toLocaleDateString() : '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Bills.layout = {
    breadcrumbs: [{ title: 'Bills', href: bills.index() }],
};
