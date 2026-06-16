import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    BarChart3,
    Check,
    Clock,
    ExternalLink,
    FileWarning,
    Flag,
    Inbox,
    Map,
    MessageCircle,
    PieChart,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    Trophy,
    User,
    Users,
} from 'lucide-react';

type TopCity = {
    id: number;
    rank: number;
    resolution: number | null;
    total_complaints: number;
    solved_complaints: number;
    city: { name: string; slug: string; state: { name: string; uf: string } };
};

type StatusBucket = {
    id: number;
    name: string;
    color: string;
    count: number;
};

type TopState = {
    id: number;
    name: string;
    uf: string;
    total: number;
};

type PendingRequest = {
    id: number;
    requester: string;
    email: string;
    created_at: string;
    city: { name: string; state: { uf: string } };
};

type ActivityItem = {
    type: 'city_request' | 'user' | 'complaint';
    title: string;
    subtitle: string;
    at: string;
};

const medalClass = (rank: number) => {
    switch (rank) {
        case 1:
            return 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40';
        case 2:
            return 'bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-500/40';
        case 3:
            return 'bg-orange-400/20 text-orange-700 dark:text-orange-300 border-orange-500/40';
        default:
            return 'bg-blue-400/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
};

const activityIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'city_request':
            return { Icon: Inbox, color: 'bg-blue-100 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300' };
        case 'user':
            return { Icon: User, color: 'bg-green-100 text-green-500 dark:bg-green-500/20 dark:text-green-300' };
        case 'complaint':
            return { Icon: FileWarning, color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' };
    }
};

const formatRelativeTime = (iso: string) => {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'agora há pouco';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return `há ${Math.floor(diff / 86400)} dias`;
};

const fmt = (n: number | string) => Number(n).toLocaleString('pt-BR');

export default function AdminIndex() {
    const {
        users,
        complaints,
        municipalities,
        cityRequests,
        topCities,
        recentActivity,
        newUsers30d,
        newComplaints30d,
        statusBuckets,
        resolutionRate,
        topStates,
        pendingRequests,
        pendingDisputes,
        pendingDisputesList,
    } = usePage().props as any;
    const disputes: Array<{
        id: number;
        reason: string | null;
        created_at: string;
        complaint: { id: number; title: string };
        municipality: { name: string; city: { name: string; state: { uf: string } } };
    }> = pendingDisputesList || [];

    const top: TopCity[] = topCities || [];
    const buckets: StatusBucket[] = statusBuckets || [];
    const states: TopState[] = topStates || [];
    const pending: PendingRequest[] = pendingRequests || [];
    const activity: ActivityItem[] = recentActivity || [];

    const totalForBuckets = Math.max(1, buckets.reduce((acc, b) => acc + b.count, 0));
    const maxState = Math.max(1, ...states.map((s) => s.total));

    const breadcrumbs = [
        {
            title: 'Painel de Controle',
            href: '/admin',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Painel Admin" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Banner */}
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">Painel de Controle</h1>
                                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    ADMIN
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">Visão operacional da plataforma</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {Number(pendingDisputes) > 0 && (
                            <Link
                                href={route('admin.disputes.index')}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-white shadow-sm transition-all hover:bg-amber-600"
                            >
                                <ShieldAlert className="h-4 w-4" />
                                {Number(pendingDisputes)} contestaç{Number(pendingDisputes) === 1 ? 'ão' : 'ões'}
                            </Link>
                        )}
                        {Number(cityRequests) > 0 && (
                            <Link
                                href={route('admin.solicitations.index')}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white shadow-sm transition-all hover:bg-red-600"
                            >
                                <Inbox className="h-4 w-4" />
                                {Number(cityRequests)} solicitaç{Number(cityRequests) === 1 ? 'ão' : 'ões'}
                            </Link>
                        )}
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-xl border p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center rounded-lg bg-sky-100 p-2 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300">
                                <Map className="h-5 w-5" />
                            </div>
                            <TrendingUp className="text-muted-foreground h-4 w-4" />
                        </div>
                        <p className="text-muted-foreground text-sm">Cidades Ativas</p>
                        <p className="text-3xl font-bold">{fmt(municipalities)}</p>
                    </div>
                    <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-xl border p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center rounded-lg bg-green-100 p-2 text-emerald-500 dark:bg-green-500/20 dark:text-green-300">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                +{fmt(newUsers30d || 0)} / 30d
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">Usuários Cadastrados</p>
                        <p className="text-3xl font-bold">{fmt(users)}</p>
                    </div>
                    <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-xl border p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center rounded-lg bg-yellow-100 p-2 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                +{fmt(newComplaints30d || 0)} / 30d
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">Total de Reclamações</p>
                        <p className="text-3xl font-bold">{fmt(complaints)}</p>
                    </div>
                    <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-xl border p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center justify-center rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-muted-foreground text-xs">global</span>
                        </div>
                        <p className="text-muted-foreground text-sm">Taxa de Resolução</p>
                        <p className="text-3xl font-bold">{resolutionRate ?? 0}%</p>
                    </div>
                </div>

                {/* Status + Solicitações pendentes */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="border-border bg-primary-foreground col-span-1 rounded-xl border p-6 lg:col-span-2">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-indigo-500" />
                                <div>
                                    <h2 className="text-lg font-bold">Distribuição por status</h2>
                                    <p className="text-muted-foreground text-xs">Total: {fmt(complaints)} reclamações</p>
                                </div>
                            </div>
                            <Link href={route('admin.complaints.index')} className="text-sm text-blue-500 hover:underline">
                                Ver todas →
                            </Link>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                            {buckets.map((b) => {
                                const pct = (b.count / totalForBuckets) * 100;
                                return (
                                    <div key={b.id}>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block h-2.5 w-2.5 rounded-full ${b.color}`} />
                                                <span className="font-medium">{b.name}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                                {fmt(b.count)} <span className="text-xs">({pct.toFixed(1)}%)</span>
                                            </span>
                                        </div>
                                        <div className="bg-muted mt-1.5 h-2 w-full overflow-hidden rounded-full">
                                            <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <h2 className="text-lg font-bold">Solicitações pendentes</h2>
                            </div>
                            {Number(cityRequests) > 0 && (
                                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                    {fmt(cityRequests)}
                                </span>
                            )}
                        </div>

                        {pending.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10 text-center text-sm">
                                <Check className="text-muted-foreground/60 h-10 w-10" />
                                Sem solicitações pendentes.
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-col gap-2">
                                {pending.map((p) => (
                                    <Link
                                        href={route('admin.solicitations.index')}
                                        key={p.id}
                                        className="border-border hover:bg-muted/40 flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{p.city?.name}/{p.city?.state?.uf}</p>
                                            <p className="text-muted-foreground truncate text-xs">{p.requester}</p>
                                        </div>
                                        <span className="text-muted-foreground flex-shrink-0 text-xs">
                                            {formatRelativeTime(p.created_at)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contestações pendentes */}
                {Number(pendingDisputes) > 0 && (
                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-bold">
                                    Contestações pendentes
                                    <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                        {Number(pendingDisputes)}
                                    </span>
                                </h2>
                            </div>
                            <Link href={route('admin.disputes.index')} className="text-sm text-blue-500 hover:underline">
                                Ver todas →
                            </Link>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            {disputes.map((d) => (
                                <Link
                                    href={route('admin.complaints.show', d.complaint.id)}
                                    key={d.id}
                                    className="border-border hover:bg-muted/40 flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            <span className="text-muted-foreground">#{d.complaint.id}</span>{' '}
                                            {d.complaint.title}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            <Flag className="inline h-3 w-3 mr-1" />
                                            {d.municipality.name}/{d.municipality.city?.state?.uf} contestou
                                        </p>
                                        {d.reason && (
                                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs italic">"{d.reason}"</p>
                                        )}
                                    </div>
                                    <span className="text-muted-foreground flex-shrink-0 text-xs">
                                        {formatRelativeTime(d.created_at)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ranking + Estados */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <h2 className="text-lg font-bold">Top 5 cidades</h2>
                            </div>
                            <Link href={route('ranking.index')} className="text-sm text-blue-500 hover:underline">
                                Ver todas →
                            </Link>
                        </div>

                        {top.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                                <Trophy className="text-muted-foreground/60 h-10 w-10" />
                                Sem dados de ranking.
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-2">
                                {top.map((item) => (
                                    <Link
                                        href={route('ranking.city', {
                                            stateUf: item.city.state.uf.toLowerCase(),
                                            citySlug: item.city.slug,
                                        })}
                                        key={item.id}
                                        className={`flex flex-row items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:opacity-90 ${medalClass(item.rank)}`}
                                    >
                                        <div className="flex flex-row items-center gap-3">
                                            <div className="bg-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                                                {item.rank}
                                            </div>
                                            <div>
                                                <p className="text-foreground font-medium">{item.city.name}</p>
                                                <p className="text-muted-foreground text-xs">{item.city.state.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-foreground text-sm font-semibold">{item.resolution ?? 0}%</p>
                                            <p className="text-muted-foreground text-xs">
                                                {item.solved_complaints}/{item.total_complaints}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                <h2 className="text-lg font-bold">Estados com mais reclamações</h2>
                            </div>
                        </div>

                        {states.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                                <Map className="text-muted-foreground/60 h-10 w-10" />
                                Sem reclamações registradas ainda.
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-3">
                                {states.map((s) => (
                                    <div key={s.id} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-muted text-muted-foreground inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded font-mono text-xs">
                                                    {s.uf}
                                                </span>
                                                <span className="font-medium">{s.name}</span>
                                            </div>
                                            <span className="text-muted-foreground">{fmt(s.total)}</span>
                                        </div>
                                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                            <div className="h-full bg-blue-500" style={{ width: `${(s.total / maxState) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Atividade recente */}
                <div className="border-border bg-primary-foreground rounded-xl border p-6">
                    <div className="border-border flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-500" />
                            <h2 className="text-lg font-bold">Atividade recente</h2>
                        </div>
                    </div>

                    {activity.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center text-sm">
                            <Clock className="text-muted-foreground/60 h-10 w-10" />
                            Nenhuma atividade registrada ainda.
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                            {activity.map((item, idx) => {
                                const { Icon, color } = activityIcon(item.type);
                                return (
                                    <div
                                        key={idx}
                                        className="border-border flex flex-row items-center gap-3 rounded-lg border p-3"
                                    >
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{item.title}</p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {item.subtitle} {item.at && <>• {formatRelativeTime(item.at)}</>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
