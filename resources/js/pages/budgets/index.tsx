import { Form, Head } from '@inertiajs/react';
import { Plus, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

type Budget = {
    id: number;
    name: string;
    limit: string;
    spent: string;
    period: string;
    period_start: string;
    period_end: string;
    percentage: number;
    category_name: string;
};

type Props = {
    budgets: Budget[];
    categories: Array<{ id: number; name: string }>;
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

export default function Budgets({ budgets, categories }: Props) {
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);

    return (
        <>
            <Head title="Budgets" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{formatCurrency(totalBudget.toString())}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{formatCurrency(totalSpent.toString())}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-semibold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency((totalBudget - totalSpent).toString())}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Create Budget</CardTitle>
                        <CardDescription>Set spending limits for categories or overall spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={storeBudget().url} method="post" className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Budget Name</Label>
                                        <Input id="name" name="name" placeholder="e.g., Dining Out" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="limit">Monthly Limit</Label>
                                        <Input id="limit" name="limit" type="number" step="0.01" placeholder="0.00" required />
                                        <InputError message={errors.limit} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="period">Period</Label>
                                        <select
                                            id="period"
                                            name="period"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                        <InputError message={errors.period} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="period_start">Start Date</Label>
                                        <Input id="period_start" name="period_start" type="date" required />
                                        <InputError message={errors.period_start} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">Category (Optional)</Label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">All spending</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="mr-2 size-4" />
                                            Create Budget
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your Budgets</CardTitle>
                        <CardDescription>Monitor your spending against budgets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {budgets.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No budgets yet. Create one to track your spending.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {budgets.map((budget) => (
                                    <div key={budget.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <p className="font-medium">{budget.name}</p>
                                                <p className="text-sm text-muted-foreground">{budget.category_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</p>
                                                <p className="text-sm text-muted-foreground">{Math.round(budget.percentage)}% used</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all ${
                                                    budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(100, budget.percentage)}%` }}
                                            />
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

Budgets.layout = {
    breadcrumbs: [
        {
            title: 'Budgets',
            href: budgetsIndex().url,
        },
    ],
};
