import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Banknote, ChevronRight, ListChecks, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import accounts, { transfer } from '@/routes/accounts';
import transactions from '@/routes/transactions';

type Account = {
    id: number;
    name: string;
    account_number: string;
    type: string;
    balance: string;
    currency: string;
};

type Transaction = {
    id: number;
    transaction_type: string;
    amount: string;
    description: string;
    created_at: string;
    account_name: string;
};

type Props = {
    account: Account;
    transactions: Transaction[];
    otherAccounts: Account[];
    balance: string;
};

function formatCurrency(value: string, currency: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(Number(value));
}

export default function AccountShow({ account, transactions: accountTransactions, otherAccounts }: Props) {
    const [amount, setAmount] = useState('');

    return (
        <>
            <Head title={account.name} />

            <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="border lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <Wallet className="size-5" />
                                <CardTitle>{account.name}</CardTitle>
                            </div>
                            <CardDescription>{account.type} account</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Account number
                                </p>
                                <p className="mt-1 font-medium">
                                    {account.account_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Available balance
                                </p>
                                <p className="mt-1 text-3xl font-semibold">
                                    {formatCurrency(account.balance, account.currency)}
                                </p>
                            </div>
                            <div className="grid gap-3 rounded-3xl border border-border bg-muted p-4">
                                <div className="flex items-center gap-2 text-secondary">
                                    <ShieldCheck className="size-5" />
                                    <span>Secure transfers</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Move money between your linked accounts instantly.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ArrowRight className="size-4" />
                                    Transfers are processed immediately.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border">
                        <CardHeader>
                            <CardTitle>Transfer funds</CardTitle>
                            <CardDescription>Send money to another account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Form {...transfer.form(account.id)} className="space-y-4">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="destination_account_id">
                                                Send to
                                            </Label>
                                            <select
                                                id="destination_account_id"
                                                name="destination_account_id"
                                                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                required
                                            >
                                                <option value="">Select account</option>
                                                {otherAccounts.map((other) => (
                                                    <option key={other.id} value={other.id}>
                                                        {other.name} — {other.account_number}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.destination_account_id} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount</Label>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={amount}
                                                onChange={(event) => setAmount(event.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                            <InputError message={errors.amount} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Memo</Label>
                                            <Input
                                                id="description"
                                                name="description"
                                                placeholder="Payment for lunch"
                                            />
                                            <InputError message={errors.description} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={processing || otherAccounts.length === 0}>
                                            {processing ? 'Transferring…' : 'Transfer'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                            {otherAccounts.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Add another account to enable transfers.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>Recent activity</CardTitle>
                                <CardDescription>
                                    Latest movements on this account.
                                </CardDescription>
                            </div>
                            <Link href={transactions.index()} className="inline-flex items-center gap-2 text-primary">
                                See all
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {accountTransactions.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                    No transactions found for this account yet.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {accountTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">{transaction.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.transaction_type} · {transaction.account_name}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    {formatCurrency(transaction.amount, account.currency)}
                                                </p>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {new Date(transaction.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

AccountShow.layout = {
    breadcrumbs: [
        {
            title: 'Accounts',
            href: accounts.index(),
        },
    ],
};
