import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLogin() {
    return <>
        <Head title="Administrator sign in" />
        <Form action="/admin/login" method="post" resetOnSuccess={['password']} className="flex flex-col gap-6">
            {({ processing, errors }) => <>
                <div className="rounded-3xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">NovaTrust Bank administration</p>
                    <p className="mt-1">Use your dedicated administrator credentials to access the platform console.</p>
                </div>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Administrator email</Label>
                        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus placeholder="Administrator email" />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput id="password" name="password" autoComplete="current-password" required />
                        <InputError message={errors.password} />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing && <Spinner />}
                        Sign in to administration
                    </Button>
                </div>
            </>}
        </Form>
    </>;
}

AdminLogin.layout = {
    title: 'Administrator sign in',
    description: 'Access the secure NovaTrust Bank administration console',
};
