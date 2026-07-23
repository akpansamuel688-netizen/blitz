import { Head, Link } from '@inertiajs/react';
import { Clock3, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import transactions from '@/routes/transactions';

type Transaction = {
    id: number;
    transaction_type: string;
    amount: string;
    description: string;
    created_at: string;
    account_name: string;
};

type Props = {
    transactions: Transaction[];
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

export default function Transactions({ transactions: transactionItems }: Props) {
    return (
        <>
            <Head title="Transactions" />

            <div className="space-y-6">
                <Card className="border">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <ListChecks className="size-5" />
                            <CardTitle>Transactions</CardTitle>
                        </div>
                        <CardDescription>All activity across your accounts.</CardDescription>
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
                                                    {transaction.transaction_type} · {transaction.account_name}
                                                </p>
                                            </div>
                                            <p className="text-right text-sm font-semibold">
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
