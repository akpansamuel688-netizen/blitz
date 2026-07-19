import { Form, Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { store as storeCategory, index as categoriesIndex } from '@/routes/categories';

type Category = {
    id: number;
    name: string;
    color: string;
    icon?: string;
    transaction_count: number;
};

type Props = {
    categories: Category[];
};

export default function Categories({ categories }: Props) {
    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6">
                <Card className="border">
                    <CardHeader>
                        <CardTitle>Create Category</CardTitle>
                        <CardDescription>Add a new category to organize your transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={storeCategory().url} method="post" className="grid gap-4 sm:grid-cols-3">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Category Name</Label>
                                        <Input id="name" name="name" placeholder="e.g., Groceries" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" name="color" type="color" defaultValue="#6366f1" required />
                                        <InputError message={errors.color} />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            <Plus className="mr-2 size-4" />
                                            Add Category
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border">
                    <CardHeader>
                        <CardTitle>Your Categories</CardTitle>
                        <CardDescription>Manage transaction categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                                No categories yet. Create one to organize your transactions.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                                        style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="size-3 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <p className="font-medium">{category.name}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {category.transaction_count} transaction{category.transaction_count !== 1 ? 's' : ''}
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

Categories.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex().url,
        },
    ],
};
