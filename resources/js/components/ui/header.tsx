import AppLogo from '../app-logo';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './button';

type NavItem = {
    label: string;
    href: string;
    inertia?: boolean;
};

export default function Header() {
    const { auth, url } = usePage().props as any;
    const currentPath = (usePage() as any).url as string;
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [currentPath]);

    const isHome = currentPath === '/' || currentPath?.startsWith('/?');

    const navItems: NavItem[] = [
        { label: 'Ranking', href: route('ranking.index'), inertia: true },
        { label: 'Cidades em Destaque', href: isHome ? '#cidades-destaque' : '/#cidades-destaque' },
        { label: 'Como Funciona', href: isHome ? '#como-funciona' : '/#como-funciona' },
    ];

    const renderNavLink = (item: NavItem, onNavigate?: () => void) => {
        const baseClasses =
            'text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors';

        if (item.inertia) {
            return (
                <Link key={item.label} href={item.href} className={baseClasses} onClick={onNavigate}>
                    {item.label}
                </Link>
            );
        }

        return (
            <a key={item.label} href={item.href} className={baseClasses} onClick={onNavigate}>
                {item.label}
            </a>
        );
    };

    return (
        <header className="bg-primary-foreground border-border sticky top-0 z-30 border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-80">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
                <Link
                    href={route('home')}
                    aria-label="Página inicial"
                    className="hover:opacity-90 transition-opacity"
                >
                    <AppLogo className="flex items-center gap-2" textClassName="!text-base" />
                </Link>

                <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
                    {navItems.map((item) => renderNavLink(item))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 md:flex">
                        {!auth?.user ? (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="outline" className="cursor-pointer">
                                        Login
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button variant="default" className="cursor-pointer">
                                        Cadastrar
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Link href={route('dashboard')}>
                                <Button variant="outline" className="cursor-pointer">
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                        className="text-foreground hover:bg-muted inline-flex items-center justify-center rounded-md p-2 md:hidden"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-border bg-primary-foreground border-t md:hidden">
                    <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Navegação móvel">
                        {navItems.map((item) => renderNavLink(item, () => setMobileOpen(false)))}

                        <div className="border-border mt-2 flex flex-col gap-2 border-t pt-3">
                            {!auth?.user ? (
                                <>
                                    <Link href={route('login')} className="w-full">
                                        <Button variant="outline" className="w-full cursor-pointer">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href={route('register')} className="w-full">
                                        <Button variant="default" className="w-full cursor-pointer">
                                            Cadastrar
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <Link href={route('dashboard')} className="w-full">
                                    <Button variant="outline" className="w-full cursor-pointer">
                                        Dashboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
