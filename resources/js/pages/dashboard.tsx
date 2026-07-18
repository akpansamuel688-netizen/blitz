import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ListChecks, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { accounts } from '@/routes/accounts';
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

export default function Dashboard({ accounts: userAccounts, totalBalance, accountCount }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <Wallet className="size-5" />
                                <CardTitle>Net worth</CardTitle>
                            </div>
                            <CardDescription>Combined balance across all accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {formatCurrency(totalBalance, 'USD')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle>Accounts</CardTitle>
                            <CardDescription>Currently active accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{accountCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle>Recent activity</CardTitle>
                            <CardDescription>Quick access to transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {userAccounts.length > 0
                                    ? 'Manage your money with confidence.'
                                    : 'Add an account to get started.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Accounts overview</CardTitle>
                        <CardDescription>Fast access to the accounts you use most.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {userAccounts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No accounts are available. Visit Accounts to create one.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {userAccounts.slice(0, 4).map((account) => (
                                    <div
                                        key={account.id}
                                        className="rounded-3xl border border-border bg-background p-6 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                                                    {account.type}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold">
                                                    {formatCurrency(account.balance, account.currency)}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {account.name}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                                <Wallet className="size-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="flex justify-end px-6 pb-6">
                        <Button asChild>
                            <Link href={accounts()}>
                                View all accounts
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button asChild>
                        <Link href={transactions()}>
                            Review transactions
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: accounts(),
        },
    ],
};
