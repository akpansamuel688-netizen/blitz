import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    CreditCard,
    LayoutDashboard,
    LayoutGrid,
    ListChecks,
    PiggyBank,
    Receipt,
    Repeat2,
    Shield,
    Send,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import accounts from '@/routes/accounts';
import admin from '@/routes/admin';
import bills from '@/routes/bills';
import budgets from '@/routes/budgets';
import { dashboard } from '@/routes';
import recurringTransfers from '@/routes/recurring-transfers';
import transactions from '@/routes/transactions';
import type { NavItem } from '@/types';

const bankingNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Accounts',
        href: accounts.index(),
        icon: Wallet,
    },
    {
        title: 'Cards',
        href: '/cards',
        icon: CreditCard,
    },
    {
        title: 'Transactions',
        href: transactions.index(),
        icon: ListChecks,
    },
    {
        title: 'Transfers',
        href: '/transfers',
        icon: Send,
    },
];

const moneyNavItems: NavItem[] = [
    {
        title: 'Bills',
        href: bills.index(),
        icon: Receipt,
    },
    {
        title: 'Budgets',
        href: budgets.index(),
        icon: PiggyBank,
    },
    {
        title: 'Recurring',
        href: recurringTransfers.index(),
        icon: Repeat2,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin console',
        href: admin.dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: admin.users.index(),
        icon: Users,
    },
    {
        title: 'All accounts',
        href: admin.accounts.index(),
        icon: Shield,
    },
    {
        title: 'Card requests',
        href: '/admin/cards',
        icon: CreditCard,
    },
    {
        title: 'Transfers',
        href: '/admin/transfers',
        icon: Send,
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: ListChecks,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/',
        icon: Home,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={bankingNavItems} label="Banking" />
                <NavMain items={moneyNavItems} label="Money tools" />
                {auth.isAdmin && <NavMain items={adminNavItems} label="Administration" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
