import { Form, Head } from '@inertiajs/react';
import { Plus, Repeat2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';import { store as storeRecurring, index as recurringIndex } from '@/routes/recurring-transfers';
type Transfer = {
    id: number;
    source_account: string;
    destination_account: string;
    amount: string;
    frequency: string;
    next_transfer_date: string;
    is_active: boolean;
    description?: string;
};

type Props = {
    transfers: Transfer[];
    accounts: Array<{ id: number; name: string }>;
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

export default function RecurringTransfers({ transfers, accounts }: Props) {
    const activeTransfers = transfers.filter((t) => t.is_active);

    return (
        <>
            <Head title="Recurring Transfers" />

            <div className="space-y-6">
                <Card className="border">
                    <CardHeader>
                        <CardTitle>Schedule Recurring Transfer</CardTitle>
                        <CardDescription>Automatically move money between your accounts on a schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={storeRecurring().url} method="post" className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="source_account_id">From Account</Label>
                                        <select
                                            id="source_account_id"
                                            name="source_account_id"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.source_account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="destination_account_id">To Account</Label>
                                        <select
                                            id="destination_account_id"
                                            name="destination_account_id"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.destination_account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                        <InputError message={errors.amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <select
                                            id="frequency"
                                            name="frequency"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <InputError message={errors.frequency} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="next_transfer_date">First Transfer Date</Label>
                                        <Input id="next_transfer_date" name="next_transfer_date" type="date" required />
                                        <InputError message={errors.next_transfer_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_date">End Date (Optional)</Label>
                                        <Input id="end_date" name="end_date" type="date" />
                                        <InputError message={errors.end_date} />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input id="description" name="description" placeholder="e.g., Savings transfer" />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="mr-2 size-4" />
                                            Schedule Transfer
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your Recurring Transfers</CardTitle>
                        <CardDescription>Monitor scheduled automatic transfers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No recurring transfers scheduled yet.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {transfers.map((transfer) => (
                                    <div key={transfer.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Repeat2 className="size-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {transfer.source_account} → {transfer.destination_account}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {transfer.frequency.charAt(0).toUpperCase() + transfer.frequency.slice(1)} {transfer.description && `• ${transfer.description}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!transfer.is_active && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                                                <p className="text-sm text-muted-foreground">Next: {new Date(transfer.next_transfer_date).toLocaleDateString()}</p>
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
    breadcrumbs: [
        {
            title: 'Recurring Transfers',
            href: recurringIndex().url,
        },
    ],
};
