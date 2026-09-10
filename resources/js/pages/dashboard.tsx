import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, FileWarning, Hourglass, Plus, Radar } from 'lucide-react';

interface Complaint {
    id: number;
    title?: string;
    status: string;
    created_at: string;
    // adiciona outros campos conforme teu model
}

export default function Dashboard() {
    const { auth, myComplaints } = usePage<{ myComplaints: Complaint[]; auth: any }>().props;

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Início', href: '/dashboard' }];

    // contadores derivados da lista
    const total = myComplaints.length;
    const emAndamento = myComplaints.filter((c) => c.status === 'in_progress' || c.status === 'pending').length;
    const resolvidas = myComplaints.filter((c) => c.status === 'resolved').length;
    const acompanhando = total; // ajusta se tiver lógica de "seguindo" separada

    const cards = [
        { title: 'Total de reclamações', value: total, icon: FileWarning, color: 'bg-blue-500' },
        { title: 'Em andamento', value: emAndamento, icon: Hourglass, color: 'bg-yellow-500' },
        { title: 'Resolvidas', value: resolvidas, icon: Check, color: 'bg-green-500' },
        { title: 'Acompanhando', value: acompanhando, icon: Radar, color: 'bg-violet-500' },
    ];

    // pega as 4 reclamações mais recentes pra atividade
    const atividadeRecente = [...myComplaints].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-8">
                    <div>
                        <h1 className="text-2xl font-bold">Bem vindo, {auth.user.name.split(' ')[0] as string}! 👋</h1>
                        <p className="text-md text-muted-foreground">Você tem {emAndamento} reclamação(ões) em andamento</p>
                    </div>
                    <div>
                        <Link
                            href="/reclamacoes/criar"
                            className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
                            as="button"
                        >
                            <Plus />
                            Nova Reclamação
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="border-border bg-primary-foreground flex flex-col items-center gap-4 rounded-xl border p-6"
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full p-3 ${card.color}`}>
                                    <Icon className="h-full w-full text-white" />
                                </div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <h2 className="text-lg font-light">{card.title}</h2>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="border-border bg-primary-foreground col-span-2 rounded-xl border p-6">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold">Atividade recente</h2>
                            <p className="text-md text-muted-foreground">Veja suas atividades recentes</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            {atividadeRecente.length === 0 && <p className="text-muted-foreground py-4 text-sm">Nenhuma atividade ainda.</p>}
                            {atividadeRecente.map((c) => (
                                <div key={c.id} className="flex flex-row items-center justify-between gap-4">
                                    <div>
                                        <Check />
                                    </div>
                                    <div className="w-full">
                                        <p>{c.title ?? `Reclamação #${c.id}`}</p>
                                        <p className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <span className="rounded-full bg-green-400/40 px-2 py-1 font-semibold whitespace-nowrap text-green-700 dark:text-green-500">
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold">Notificações</h2>
                            <p className="text-md text-muted-foreground">Veja suas notificações</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            <p className="text-muted-foreground py-4 text-sm">Sem notificações no momento.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
