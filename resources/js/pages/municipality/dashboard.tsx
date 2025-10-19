import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Plus, FileWarning, Hourglass, Check, Radar } from 'lucide-react';

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
                        <p className="text-md text-muted-foreground">A prefeitura possui {10} reclamações pendentes</p>
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
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                    <div className='col-span-2 border border-border rounded-xl p-6 bg-primary-foreground'>
                        <div className='border-b border-border pb-2'>
                            <h2 className="text-xl font-bold">Atividade recente</h2>
                            <p className="text-md text-muted-foreground">Veja suas atividades recentes</p>
                        </div>
                        <div className='flex flex-col gap-4 mt-4'>
                            <div className='flex flex-row justify-between items-center gap-4'>
                                <div>
                                    <Check />
                                </div>
                                <div className='w-full'>
                                    <p>
                                        Buraco na Rua das Flores foi resolvido
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Centro • Há 2 horas
                                    </p>
                                </div>
                                <span className='bg-green-400/40 text-green-700 dark:text-green-500 font-semibold px-2 py-1 rounded-full'>
                                    Resolvido
                                </span>
                            </div>
                            <div className='flex flex-row justify-between items-center gap-4'>
                                <div>
                                    <Check />
                                </div>
                                <div className='w-full'>
                                    <p>
                                        Buraco na Rua das Flores foi resolvido
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Centro • Há 2 horas
                                    </p>
                                </div>
                                <span className='bg-green-400/40 text-green-700 dark:text-green-500 font-semibold px-2 py-1 rounded-full'>
                                    Resolvido
                                </span>
                            </div>
                            <div className='flex flex-row justify-between items-center gap-4'>
                                <div>
                                    <Check />
                                </div>
                                <div className='w-full'>
                                    <p>
                                        Buraco na Rua das Flores foi resolvido
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Centro • Há 2 horas
                                    </p>
                                </div>
                                <span className='bg-green-400/40 text-green-700 dark:text-green-500 font-semibold px-2 py-1 rounded-full'>
                                    Resolvido
                                </span>
                            </div>
                            <div className='flex flex-row justify-between items-center gap-4'>
                                <div>
                                    <Check />
                                </div>
                                <div className='w-full'>
                                    <p>
                                        Buraco na Rua das Flores foi resolvido
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Centro • Há 2 horas
                                    </p>
                                </div>
                                <span className='bg-green-400/40 text-green-700 dark:text-green-500 font-semibold px-2 py-1 rounded-full'>
                                    Resolvido
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='border border-border rounded-xl p-6 bg-primary-foreground'>
                        <div className='border-b border-border pb-2'>
                            <h2 className="text-xl font-bold">Notificações</h2>
                            <p className="text-md text-muted-foreground">Veja suas notificações</p>
                        </div>
                        <div className='flex flex-col gap-4 mt-4'>
                            <div className='flex flex-row items-center gap-4'>
                                <span className='bg-blue-400 font-semibold p-1 rounded-full'>
                                </span>
                                <div>
                                    <p>
                                        Sua reclamação #1234 foi atualizada pela prefeitura
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Há 1 hora
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-4'>
                                <span className='bg-blue-400 font-semibold p-1 rounded-full'>
                                </span>
                                <div>
                                    <p>
                                        Sua reclamação #1234 foi atualizada pela prefeitura
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Há 1 hora
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-4'>
                                <span className='bg-blue-400 font-semibold p-1 rounded-full'>
                                </span>
                                <div>
                                    <p>
                                        Sua reclamação #1234 foi atualizada pela prefeitura
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Há 1 hora
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-4'>
                                <span className='bg-gray-400 font-semibold p-1 rounded-full'>
                                </span>
                                <div>
                                    <p>
                                        Sua reclamação #1234 foi atualizada pela prefeitura
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Há 1 hora
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
