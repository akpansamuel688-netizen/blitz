import { Form, Head } from '@inertiajs/react';
import { Plus, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { store as storeSavingsGoal, index as goalsIndex } from '@/routes/savings-goals';

type Goal = {
    id: number;
    name: string;
    description?: string;
    target_amount: string;
    current_amount: string;
    target_date?: string;
    status: string;
    percentage: number;
    color: string;
    account_name: string;
};

type Props = {
    goals: Goal[];
    accounts: Array<{ id: number; name: string }>;
};

function formatCurrency(value: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

export default function SavingsGoals({ goals, accounts }: Props) {
    const activeGoals = goals.filter((g) => g.status === 'active');
    const totalGoal = activeGoals.reduce((sum, g) => sum + parseFloat(g.target_amount), 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + parseFloat(g.current_amount), 0);

    return (
        <>
            <Head title="Savings Goals" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{activeGoals.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Goal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{formatCurrency(totalGoal.toString())}</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalSaved.toString())}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Create Savings Goal</CardTitle>
                        <CardDescription>Set a target and track your progress toward important financial goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={storeSavingsGoal().url} method="post" className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Goal Name</Label>
                                        <Input id="name" name="name" placeholder="e.g., Vacation" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_amount">Target Amount</Label>
                                        <Input id="target_amount" name="target_amount" type="number" step="0.01" placeholder="0.00" required />
                                        <InputError message={errors.target_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input id="description" name="description" placeholder="Add details about your goal" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_date">Target Date (Optional)</Label>
                                        <Input id="target_date" name="target_date" type="date" />
                                        <InputError message={errors.target_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_id">Link Account (Optional)</Label>
                                        <select
                                            id="account_id"
                                            name="account_id"
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">No account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" name="color" type="color" defaultValue="#10b981" />
                                        <InputError message={errors.color} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="mr-2 size-4" />
                                            Create Goal
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your Savings Goals</CardTitle>
                        <CardDescription>Track progress toward your financial goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {goals.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No savings goals yet. Create one to start tracking your progress.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Target className="size-5" style={{ color: goal.color }} />
                                                    <div>
                                                        <p className="font-medium">{goal.name}</p>
                                                        <p className="text-sm text-muted-foreground">{goal.account_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</p>
                                                <p className="text-sm text-muted-foreground">{Math.round(goal.percentage)}% complete</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                                            <div
                                                className="h-2.5 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, goal.percentage)}%`,
                                                    backgroundColor: goal.color,
                                                }}
                                            />
                                        </div>
                                        {goal.target_date && (
                                            <p className="text-sm text-muted-foreground">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                                        )}
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

SavingsGoals.layout = {
    breadcrumbs: [
        {
            title: 'Savings Goals',
            href: goalsIndex().url,
        },
    ],
};
