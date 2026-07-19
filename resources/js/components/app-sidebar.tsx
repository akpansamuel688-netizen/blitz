import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    LayoutDashboard,
    LayoutGrid,
    ListChecks,
    Shield,
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
import { dashboard } from '@/routes';
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
        title: 'Transactions',
        href: transactions.index(),
        icon: ListChecks,
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
                {auth.isAdmin && <NavMain items={adminNavItems} label="Administration" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
