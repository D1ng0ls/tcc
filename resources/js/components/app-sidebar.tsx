import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Award, Files, Inbox, Landmark, Layers, LayoutDashboard, LucideHome, Mails, MapPin, Plus } from 'lucide-react';
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
        ],
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
                title: 'Reclamações',
                href: route('admin.complaints.index'),
                icon: Inbox,
            },
            {
                title: 'Solicitações',
                href: route('admin.solicitations.index'),
                icon: Mails,
            },
            {
                title: 'Municípios',
                href: route('admin.municipalities.index'),
                icon: Landmark,
            },
        ],
    },
    {
        category: 'Painel Municipal',
        items: [
            {
                title: 'Dashboard',
                href: route('municipality.dashboard'),
                icon: LayoutDashboard,
            },
            {
                title: 'Reclamações',
                href: route('municipality.complaints.index'),
                icon: Inbox,
            },
            {
                title: 'Bairros',
                href: route('municipality.neighborhoods.index'),
                icon: MapPin,
            },
            {
                title: 'Departamentos',
                href: route('municipality.departments.index'),
                icon: Layers,
            },
        ],
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Ajuda',
//         href: '',
//         icon: LucideHelpCircle,
//     },
// ];

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const navItems = mainNavItems.filter((menu) => {
        if (menu.category === 'Admin' && auth?.user?.role !== 'admin') {
            return false;
        }

        if (menu.category === 'Painel Municipal' && !!auth?.user?.role) {
            return false;
        }

        if (menu.category === 'Painel' && !auth?.user?.role) {
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
