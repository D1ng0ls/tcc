import SolicitationForm from '@/components/solicitation-form';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';

function PageShell({
    children,
    isAuthenticated,
    breadcrumbs,
}: {
    children: ReactNode;
    isAuthenticated: boolean;
    breadcrumbs: BreadcrumbItem[];
}) {
    if (isAuthenticated) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Solicitar acesso" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>
            </AppLayout>
        );
    }
    return (
        <GuestLayout className="mx-auto max-w-3xl py-8">
            <Head title="Solicitar acesso" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>
        </GuestLayout>
    );
}

export default function SolicitationFormPage() {
    const { auth, initialCity } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Ranking', href: '/ranking' },
        { title: 'Solicitar acesso', href: '/solicitation-form' },
    ];

    return (
        <PageShell isAuthenticated={isAuthenticated} breadcrumbs={breadcrumbs}>
            <div className="flex min-h-[calc(100vh-10rem)] w-full flex-1 items-center justify-center">
                <div className="border-border bg-primary-foreground w-full max-w-2xl rounded-xl border p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Solicitar acesso de gestor público</h1>
                        <p className="text-muted-foreground text-sm">
                            Preencha os dados abaixo para solicitar o acesso ao painel de gestão de uma prefeitura. A
                            solicitação será analisada pela administração da plataforma.
                        </p>
                    </div>
                </div>

                    <SolicitationForm initialCity={initialCity} />
                </div>
            </div>
        </PageShell>
    );
}
