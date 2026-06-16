import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Check,
    Clock,
    FileWarning,
    Hourglass,
    Layers,
    MapPin,
    Radar,
    ThumbsUp,
    Trophy,
} from 'lucide-react';

type Stats = {
    total: number;
    open: number;
    in_progress: number;
    ended: number;
    solved: number;
};

type PendingItem = {
    id: number;
    title: string;
    address: string | null;
    district: string | null;
    created_at: string;
    neighborhood: { name: string } | null;
    department: { id: number; name: string } | null;
    user: { name: string } | null;
};

type DepartmentTotal = {
    department_id: number;
    total: number;
    department: { id: number; name: string } | null;
};

const formatRelativeTime = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'agora há pouco';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return `há ${Math.floor(diff / 86400)} dias`;
};

export default function MunicipalityDashboard() {
    const { auth, stats, resolutionRate, pendingActions, byDepartment, cityRanking } = usePage().props as any;
    const s: Stats = stats;
    const pending: PendingItem[] = pendingActions || [];
    const deptTotals: DepartmentTotal[] = byDepartment || [];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Início',
            href: '/dashboard',
        },
    ];

    const cards = [
        { title: 'Total de reclamações', value: s.total, icon: FileWarning, color: 'bg-blue-500' },
        { title: 'Aguardando análise', value: s.open, icon: AlertCircle, color: 'bg-red-500' },
        { title: 'Em andamento', value: s.in_progress, icon: Hourglass, color: 'bg-yellow-500' },
        { title: 'Aguardando avaliação', value: s.ended, icon: Radar, color: 'bg-violet-500' },
    ];

    const maxDeptTotal = Math.max(1, ...deptTotals.map((d) => d.total));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-8">
                    <div>
                        <h1 className="text-2xl font-bold">Bem vindo, {auth.user.name as string}! 🏛️</h1>
                        <p className="text-md text-muted-foreground">
                            {s.open === 0
                                ? 'Nenhuma reclamação aguardando análise no momento.'
                                : `Sua prefeitura tem ${s.open} reclamação(ões) aguardando análise.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('municipality.complaints.index')}
                            className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
                            as="button"
                        >
                            <Radar className="h-4 w-4" />
                            Ver reclamações
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
                    <div className="border-border bg-primary-foreground col-span-1 rounded-xl border p-6 lg:col-span-2">
                        <div className="border-border flex items-center justify-between border-b pb-2">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    Reclamações aguardando análise
                                </h2>
                                <p className="text-md text-muted-foreground">Reclamações abertas mais recentes</p>
                            </div>
                            <Link href={route('municipality.complaints.index')} className="text-sm text-blue-500 hover:underline">
                                Ver todas →
                            </Link>
                        </div>

                        {pending.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                                <Check className="text-muted-foreground/60 h-10 w-10" />
                                Tudo em ordem — nenhuma reclamação aguardando análise.
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-3">
                                {pending.map((c) => (
                                    <Link
                                        href={route('municipality.complaints.show', c.id)}
                                        key={c.id}
                                        className="border-border hover:bg-muted/40 flex flex-row items-center justify-between gap-4 rounded-lg border p-3 transition-colors"
                                    >
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300">
                                            <FileWarning className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{c.title}</p>
                                            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Layers className="h-3 w-3" />
                                                    {c.department?.name || '—'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {c.neighborhood?.name || c.district || 'Sem bairro'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatRelativeTime(c.created_at)}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-red-400/30 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                                            Aberto
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                Performance
                            </h2>
                            <p className="text-md text-muted-foreground">Taxa de resolução geral</p>
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                            <div>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-3xl font-bold">{resolutionRate ?? 0}%</p>
                                    <p className="text-muted-foreground text-xs">
                                        {s.solved} / {s.total} resolvidas
                                    </p>
                                </div>
                                <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${Math.min(100, resolutionRate ?? 0)}%` }}
                                    />
                                </div>
                            </div>

                            {cityRanking && (
                                <div className="border-border border-t pt-4">
                                    <p className="text-foreground font-semibold">{cityRanking.city.name}</p>
                                    <p className="text-muted-foreground text-xs">{cityRanking.city.state.name}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="border-border rounded-lg border p-3 text-center">
                                            <p className="text-muted-foreground text-xs">Brasil</p>
                                            <p className="text-2xl font-bold">{cityRanking.rank ?? '—'}º</p>
                                        </div>
                                        <div className="border-border rounded-lg border p-3 text-center">
                                            <p className="text-muted-foreground text-xs">Estado</p>
                                            <p className="text-2xl font-bold">{cityRanking.rank_state ?? '—'}º</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-border bg-primary-foreground rounded-xl border p-6">
                    <div className="border-border border-b pb-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Reclamações por departamento
                        </h2>
                        <p className="text-md text-muted-foreground">Top 5 departamentos com mais reclamações</p>
                    </div>

                    {deptTotals.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center text-sm">
                            <Layers className="text-muted-foreground/60 h-10 w-10" />
                            Sem reclamações registradas ainda.
                        </div>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3">
                            {deptTotals.map((d) => (
                                <div key={d.department_id} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{d.department?.name || '—'}</span>
                                        <span className="text-muted-foreground">{d.total}</span>
                                    </div>
                                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${(d.total / maxDeptTotal) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
