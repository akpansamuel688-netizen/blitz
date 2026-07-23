import { Head, Link } from '@inertiajs/react';
import { Clock3, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import transactions from '@/routes/transactions';

type Transaction = {
    id: number;
    transaction_type: string;
    status: string;
    amount: string;
    description: string;
    created_at: string;
    account_name: string;
};

type Props = {
    transactions: Transaction[];
    filter?: 'Credit' | 'Debit' | null;
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

export default function Transactions({ transactions: transactionItems, filter }: Props) {
    const title = filter === 'Credit' ? 'Money in' : filter === 'Debit' ? 'Money out' : 'Transactions';
    const description = filter === 'Credit' ? 'All credits into your accounts.' : filter === 'Debit' ? 'All debits from your accounts.' : 'All activity across your accounts.';
    return (
        <>
            <Head title={title} />

            <div className="space-y-6">
                <Card className="border">
                    <CardHeader>
                        <div className={`flex items-center gap-2 ${filter === 'Debit' ? 'text-rose-600 dark:text-rose-400' : 'text-primary'}`}>
                            <ListChecks className="size-5" />
                            <CardTitle>{title}</CardTitle>
                        </div>
                        <CardDescription className={filter === 'Debit' ? 'text-rose-600/80 dark:text-rose-400/80' : undefined}>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactionItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No transactions have been recorded yet.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {transactionItems.map((transaction) => (
                                    <Link
                                        key={transaction.id}
                                        href={`/transactions/${transaction.id}`}
                                        className="rounded-3xl border border-border bg-background p-4 shadow-sm transition-colors hover:border-primary/60 hover:bg-muted/30"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.transaction_type} · {transaction.account_name} · <span className="capitalize">{transaction.status}</span>
                                                </p>
                                            </div>
                                            <p className={`text-right text-sm font-semibold ${filter === 'Debit' ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                        </div>
                                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock3 className="size-4" />
                                            {new Date(transaction.created_at).toLocaleString()}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

Transactions.layout = {
    breadcrumbs: [
        {
            title: 'Transactions',
            href: transactions.index(),
        },
    ],
};
