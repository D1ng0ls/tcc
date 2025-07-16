import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LucideHome, LucideHelpCircle, Plus, ChartNoAxesCombined, Files, Award } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Início',
        href: '/dashboard',
        icon: LucideHome,
    },
    {
        title: 'Minhas Reclamações',
        href: '/complaints',
        icon: Files,
    },
    {
        title: 'Nova Reclamação',
        href: '/complaints/create',
        icon: Plus,
    },
    {
        title: 'Estatísticas',
        href: '/statics',
        icon: ChartNoAxesCombined,
    },
    {
        title: 'Ranking',
        href: '/ranking',
        icon: Award,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Ajuda',
        href: '/help',
        icon: LucideHelpCircle,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
