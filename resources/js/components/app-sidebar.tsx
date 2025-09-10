import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LucideHome, LucideHelpCircle, Plus, ChartNoAxesCombined, Files, Award, Landmark, LayoutDashboard, Users, Inbox } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: any[] = [
    {
        category: 'Painel',
        items: [
            {
                title: 'Início',
                href: route('dashboard'),
                icon: LucideHome,
            },
            {
                title: 'Minhas Reclamações',
                href: route('complaints.index'),
                icon: Files,
            },
            {
                title: 'Nova Reclamação',
                href: route('complaints.create'),
                icon: Plus,
            },
            {
                title: 'Ranking',
                href: route('ranking.index'),
                icon: Award,
            },
        ]
    },
    {
        category: 'Admin',
        items: [
            {
                title: 'Dashboard',
                href: route('admin.dashboard'),
                icon: LayoutDashboard,
            },
            {
                title: 'Solicitações',
                href: route('admin.solicitations.index'),
                icon: Inbox,
            },
            {
                title: 'Municípios',
                href: route('admin.municipalities.index'),
                icon: Landmark,
            },
            {
                title: 'Users',
                href: route('admin.users.index'),
                icon: Users,
            },
        ]
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Ajuda',
        href: '',
        icon: LucideHelpCircle,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const navItems = mainNavItems.filter(menu => {
        if (menu.category === 'Admin' && auth?.user?.role !== 'admin') {
            return false;
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navItems.map(({ category, items }) => (
                    <NavMain key={category} title={category} items={items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
