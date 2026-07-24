import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czechia',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Ivory Coast',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Republic of the Congo',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
] as const;

type CountryOption = { country: string; currency: string };
type Props = { countries: CountryOption[] };

export default function CreateCustomer({ countries }: Props) {
    const [selectedCountry, setSelectedCountry] = useState('United States');
    const selectedCurrency =
        countries.find((item) => item.country === selectedCountry)?.currency ??
        'USD';

    return (
        <>
            <Head title="Admin · New customer" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2"
                        asChild
                    >
                        <Link href={admin.users.index()}>
                            <ArrowLeft className="size-4" />
                            Back to users
                        </Link>
                    </Button>
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-brand-subtle p-2 text-brand">
                            <UserPlus className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                New Customer Application
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create a customer profile and open an Everyday
                                Checking account.
                            </p>
                        </div>
                    </div>
                </div>

                <Form action="/admin/users" method="post" className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Personal information</CardTitle>
                                    <CardDescription>
                                        Collect the identity details required to
                                        open a customer profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-3">
                                    <Field
                                        name="first_name"
                                        label="First name"
                                        error={errors.first_name}
                                        autoFocus
                                    />
                                    <Field
                                        name="middle_name"
                                        label="Middle name"
                                        error={errors.middle_name}
                                        required={false}
                                    />
                                    <Field
                                        name="last_name"
                                        label="Last name"
                                        error={errors.last_name}
                                    />
                                    <Field
                                        name="date_of_birth"
                                        label="Date of birth"
                                        type="date"
                                        error={errors.date_of_birth}
                                    />
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="tax_id">
                                            SSN / Tax ID
                                        </Label>
                                        <Input
                                            id="tax_id"
                                            name="tax_id"
                                            type="password"
                                            autoComplete="off"
                                            inputMode="numeric"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Encrypted before it is stored; it is
                                            never displayed in the admin
                                            console.
                                        </p>
                                        <InputError message={errors.tax_id} />
                                    </div>
                                    <Field
                                        name="email"
                                        label="Email address"
                                        type="email"
                                        error={errors.email}
                                    />
                                    <Field
                                        name="phone"
                                        label="Phone number"
                                        type="tel"
                                        error={errors.phone}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Address information</CardTitle>
                                    <CardDescription>
                                        Use the customer’s primary residential
                                        or mailing address.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        name="street_address"
                                        label="Street address"
                                        error={errors.street_address}
                                    />
                                    <Field
                                        name="address_line_two"
                                        label="Apartment / unit"
                                        error={errors.address_line_two}
                                        required={false}
                                    />
                                    <Field
                                        name="city"
                                        label="City"
                                        error={errors.city}
                                    />
                                    <Field
                                        name="state"
                                        label="State / region"
                                        error={errors.state}
                                    />
                                    <Field
                                        name="postal_code"
                                        label="ZIP / postal code"
                                        error={errors.postal_code}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="country">Country</Label>
                                        <select
                                            id="country"
                                            name="country"
                                            required
                                            defaultValue="United States"
                                            onChange={(event) =>
                                                setSelectedCountry(
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete="country-name"
                                            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        >
                                            {countries.map((item) => (
                                                <option
                                                    key={item.country}
                                                    value={item.country}
                                                >
                                                    {item.country} —{' '}
                                                    {item.currency}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            The new checking account and
                                            customer dashboard will use{' '}
                                            {selectedCurrency}.
                                        </p>
                                        <InputError message={errors.country} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Account access</CardTitle>
                                    <CardDescription>
                                        Set an initial password for the
                                        customer’s online-banking sign-in.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Initial password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand-subtle/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 size-5 text-brand" />
                                    <p className="text-sm text-muted-foreground">
                                        Submitting creates a customer-only
                                        account and opens an Everyday Checking
                                        account with a zero balance.
                                    </p>
                                </div>
                                <Button disabled={processing}>
                                    {processing
                                        ? 'Creating customer…'
                                        : 'Approve and create customer'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

function Field({
    name,
    label,
    type = 'text',
    error,
    required = true,
    defaultValue,
    autoFocus = false,
}: {
    name: string;
    label: string;
    type?: string;
    error?: string;
    required?: boolean;
    defaultValue?: string;
    autoFocus?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                required={required}
                defaultValue={defaultValue}
                autoFocus={autoFocus}
            />
            <InputError message={error} />
        </div>
    );
}

CreateCustomer.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin.dashboard() },
        { title: 'Users', href: admin.users.index() },
        { title: 'New customer', href: '#' },
    ],
};
