import { Form, Head } from '@inertiajs/react';
import { AlertCircle, Calendar, DollarSign, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { store as storeBill, index as billsIndex } from '@/routes/bills';

type Bill = {
    id: number;
    name: string;
    amount: string;
    frequency: string;
    next_due_date: string;
    status: string;
    category?: string;
    auto_pay: boolean;
    account_name: string;
};

type Props = {
    bills: Bill[];
    accounts: Array<{ id: number; name: string }>;
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
};

export default function Bills({ bills, accounts }: Props) {
    const overdueBills = bills.filter((b) => b.status === 'overdue');
    const upcomingBills = bills.filter((b) => b.status === 'pending');
    const totalMonthly = bills
        .filter((b) => b.frequency === 'monthly')
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    return (
        <>
            <Head title="Bills & Payments" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{bills.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-semibold ${overdueBills.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {overdueBills.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{formatCurrency(totalMonthly.toString())}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Add Bill</CardTitle>
                        <CardDescription>Create a new bill or payment reminder.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={storeBill().url} method="post" className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Bill Name</Label>
                                        <Input id="name" name="name" placeholder="e.g., Electric Bill" required />
                                        <InputError message={errors.name} />
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
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="annually">Annually</option>
                                        </select>
                                        <InputError message={errors.frequency} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="next_due_date">Next Due Date</Label>
                                        <Input id="next_due_date" name="next_due_date" type="date" required />
                                        <InputError message={errors.next_due_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_id">Pay From Account</Label>
                                        <select
                                            id="account_id"
                                            name="account_id"
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
                                        <InputError message={errors.account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input id="category" name="category" placeholder="e.g., Utilities" />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="mr-2 size-4" />
                                            Add Bill
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your Bills</CardTitle>
                        <CardDescription>Track and manage your upcoming payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {bills.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No bills yet. Add one to get started.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {bills.map((bill) => (
                                    <div
                                        key={bill.id}
                                        className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{bill.name}</p>
                                                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[bill.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                                                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {bill.account_name} • {bill.category && `${bill.category} • `}
                                                    {bill.frequency}
                                                </p>
                                            </div>
                                            <p className="text-right font-semibold">{formatCurrency(bill.amount)}</p>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="size-4" />
                                            Due: {new Date(bill.next_due_date).toLocaleDateString()}
                                            {bill.auto_pay && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Auto-pay enabled</span>}
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
    breadcrumbs: [
        {
            title: 'Bills & Payments',
            href: billsIndex().url,
        },
    ],
};
