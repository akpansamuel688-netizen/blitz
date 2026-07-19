import { Form, Head } from '@inertiajs/react';
import { Plus, Repeat2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/money';
import recurringTransfers from '@/routes/recurring-transfers';

type Transfer = {
    id: number;
    source_account: string;
    destination_account: string;
    amount: string;
    frequency: string;
    next_transfer_date: string | null;
    is_active: boolean;
    description?: string | null;
};

type Props = {
    transfers: Transfer[];
    accounts: Array<{ id: number; name: string }>;
};

export default function RecurringTransfers({ transfers, accounts }: Props) {
    const activeCount = transfers.filter((t) => t.is_active).length;

    return (
        <>
            <Head title="Recurring transfers" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Recurring transfers</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Schedule automatic moves between your Blitz accounts.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activeCount} active schedule{activeCount === 1 ? '' : 's'}</p>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Schedule transfer</CardTitle>
                        <CardDescription>Source and destination must be different accounts you own.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...recurringTransfers.store.form()} className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="source_account_id">From</Label>
                                        <select id="source_account_id" name="source_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="">Select account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.source_account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="destination_account_id">To</Label>
                                        <select id="destination_account_id" name="destination_account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="">Select account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.destination_account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
                                        <InputError message={errors.amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <select id="frequency" name="frequency" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <InputError message={errors.frequency} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="next_transfer_date">First transfer date</Label>
                                        <Input id="next_transfer_date" name="next_transfer_date" type="date" required />
                                        <InputError message={errors.next_transfer_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_date">End date (optional)</Label>
                                        <Input id="end_date" name="end_date" type="date" />
                                        <InputError message={errors.end_date} />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input id="description" name="description" placeholder="Automatic savings" />
                                        <InputError message={errors.description} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing || accounts.length < 2}>
                                            <Plus className="size-4" />
                                            Schedule transfer
                                        </Button>
                                    </div>
                                    {accounts.length < 2 && (
                                        <p className="sm:col-span-2 text-sm text-muted-foreground">
                                            You need at least two accounts to schedule a transfer.
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
                            <Repeat2 className="size-5 text-brand" />
                            Scheduled transfers
                        </CardTitle>
                        <CardDescription>Active and paused automatic moves.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No recurring transfers scheduled yet.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {transfers.map((transfer) => (
                                    <div key={transfer.id} className="rounded-2xl border border-border p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {transfer.source_account} → {transfer.destination_account}
                                                    </p>
                                                    <Badge variant={transfer.is_active ? 'default' : 'secondary'}>
                                                        {transfer.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm capitalize text-muted-foreground">
                                                    {transfer.frequency}
                                                    {transfer.description ? ` · ${transfer.description}` : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold tabular-nums">{formatCurrency(transfer.amount)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Next{' '}
                                                    {transfer.next_transfer_date
                                                        ? new Date(transfer.next_transfer_date).toLocaleDateString()
                                                        : '—'}
                                                </p>
                                            </div>
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

RecurringTransfers.layout = {
    breadcrumbs: [{ title: 'Recurring transfers', href: recurringTransfers.index() }],
};
