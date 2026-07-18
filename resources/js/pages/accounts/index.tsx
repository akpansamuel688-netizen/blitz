import { Form, Head, Link } from '@inertiajs/react';
import { Banknote, ChevronRight, Sparkles, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { accounts, account, store } from '@/routes/accounts';
import { transactions } from '@/routes/transactions';

type Account = {
    id: number;
    name: string;
    account_number: string;
    type: string;
    balance: string;
    currency: string;
};

type Props = {
    accounts: Account[];
    totalBalance: string;
    accountCount: number;
};

function formatCurrency(value: string, currency: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(Number(value));
}

export default function Accounts({ accounts: userAccounts, totalBalance, accountCount }: Props) {
    return (
        <>
            <Head title="Accounts" />

            <div className="space-y-6">
                <Card className="border">
                    <CardHeader>
                        <CardTitle>Create account</CardTitle>
                        <CardDescription>Open a new checking or savings account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...store.form()} className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Account name</Label>
                                        <Input id="name" name="name" type="text" placeholder="Everyday Checking" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Account type</Label>
                                        <select id="type" name="type" className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" required>
                                            <option value="Checking">Checking</option>
                                            <option value="Savings">Savings</option>
                                        </select>
                                        <InputError message={errors.type} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Input id="currency" name="currency" type="text" placeholder="USD" required maxLength={3} />
                                        <InputError message={errors.currency} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="initial_balance">Starting balance</Label>
                                        <Input id="initial_balance" name="initial_balance" type="number" step="0.01" min="0" placeholder="0.00" required />
                                        <InputError message={errors.initial_balance} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            Create account
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <Wallet className="size-5" />
                                <CardTitle>Accounts</CardTitle>
                            </div>
                            <CardDescription>{accountCount} active accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {formatCurrency(totalBalance, 'USD')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-secondary">
                                <Banknote className="size-5" />
                                <CardTitle>Balances</CardTitle>
                            </div>
                            <CardDescription>Real-time available funds</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">
                                {formatCurrency(totalBalance, 'USD')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-accent">
                                <Sparkles className="size-5" />
                                <CardTitle>Activity</CardTitle>
                            </div>
                            <CardDescription>Track transactions faster</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                View your full transaction history anytime.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your accounts</CardTitle>
                        <CardDescription>
                            Tap into savings and checking accounts built for modern banking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {userAccounts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No accounts are available yet. Create one to start managing your money.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {userAccounts.map((accountItem) => (
                                    <div
                                        key={accountItem.id}
                                        className="rounded-3xl border border-border bg-background p-6 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                                                    {accountItem.type}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold">
                                                    {formatCurrency(accountItem.balance, accountItem.currency)}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {accountItem.name}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                                <Wallet className="size-6" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                                            <span>{accountItem.account_number}</span>
                                            <Link href={account(accountItem.id)} className="inline-flex items-center gap-2 font-medium text-primary">
                                                View
                                                <ChevronRight className="size-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button asChild>
                        <Link href={transactions()}>
                            View all transactions
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )
}

Accounts.layout = {
    breadcrumbs: [
        {
            title: 'Accounts',
            href: accounts(),
        },
    ],
};
