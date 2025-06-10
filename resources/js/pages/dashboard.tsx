import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, FileWarning, Hourglass, Check, Radar } from 'lucide-react';
import React from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Início',
            href: '/dashboard',
        },
    ];

    const cards = [
        {
            title: 'Total de reclamações',
            value: 7,
            icon: FileWarning,
            color: 'bg-blue-500',
        },
        {
            title: 'Em andamento',
            value: 2,
            icon: Hourglass,
            color: 'bg-yellow-500',
        },
        {
            title: 'Resolvidas',
            value: 10,
            icon: Check,
            color: 'bg-green-500',
        },
        {
            title: 'Acompanhando',
            value: 10,
            icon: Radar,
            color: 'bg-violet-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Bem vindo, {auth.user.name.split(' ')[0] as string}! 👋</h1>
                        <p>Voce tem {10} reclamações pendentes e {2} nova(s) resposta da prefeitura</p>
                    </div>
                    <div>
                        <Link href="/reclamacoes/criar" className="flex items-center gap-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 cursor-pointer transition-all px-4 py-2 " as='button'>
                            <Plus />
                            Nova Reclamação
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.title} className='border border-border rounded-xl p-6 flex flex-col items-center gap-4 bg-primary-foreground'>
                                <div className={`w-12 h-12 p-3 rounded-full flex items-center justify-center ${card.color}`}>
                                    <Icon className="w-full h-full text-white" />
                                </div>
                                <p className="text-2xl font-bold">10</p>
                                <h2 className="text-lg font-light">Total de reclamações</h2>
                            </div>
                        )
                    })}

                </div>
            </div>
        </AppLayout>
    );
}
