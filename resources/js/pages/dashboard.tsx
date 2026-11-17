import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, Bell, Check, Clock, FileWarning, Hourglass, MapPin, MessageSquare, Plus, Radar, ThumbsUp, Trophy } from 'lucide-react';

type ComplaintItem = {
    id: number;
    title: string;
    address: string | null;
    district: string | null;
    created_at: string;
    status: { id: number; name: string } | null;
    neighborhood: { name: string } | null;
    department: { name: string; municipality: { name: string; city: { name: string } } } | null;
};

type StatsShape = {
    total: number;
    in_progress: number;
    solved: number;
    awaiting_review: number;
};

const statusBadgeClass = (statusId: number | undefined) => {
    switch (statusId) {
        case 1: // OPEN
            return 'bg-blue-400/30 text-blue-600 dark:text-blue-300';
        case 2: // IN_PROGRESS
            return 'bg-yellow-400/30 text-yellow-700 dark:text-yellow-300';
        case 3: // ENDED
            return 'bg-purple-400/30 text-purple-700 dark:text-purple-300';
        case 4: // SOLVED
            return 'bg-green-400/40 text-green-700 dark:text-green-400';
        case 5: // REJECTED
            return 'bg-red-400/30 text-red-700 dark:text-red-400';
        default:
            return 'bg-gray-400/30 text-gray-700 dark:text-gray-300';
    }
};

const formatRelativeTime = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'agora há pouco';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return `há ${Math.floor(diff / 86400)} dias`;
};

type NoveltyItem = {
    id: number;
    title: string;
    latest_novelty: string | null;
};

export default function Dashboard() {
    const { auth, stats, recent, cityRanking, novelties, noveltyCount } = usePage().props as any;
    const s: StatsShape = stats;
    const recentItems: ComplaintItem[] = recent || [];
    // Novidades (RF060): reclamações com notificação não lida; somem ao abrir a reclamação.
    const noveltyList: NoveltyItem[] = novelties || [];
    const noveltyTotal: number = noveltyCount || 0;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Início',
            href: '/dashboard',
        },
    ];

    const cards = [
        { title: 'Total de reclamações', value: s.total, icon: FileWarning, color: 'bg-blue-500' },
        { title: 'Em andamento', value: s.in_progress, icon: Hourglass, color: 'bg-yellow-500' },
        { title: 'Aguardando avaliação', value: s.awaiting_review, icon: Radar, color: 'bg-violet-500' },
        { title: 'Resolvidas', value: s.solved, icon: Check, color: 'bg-green-500' },
    ];

    const pendingResponses = s.awaiting_review;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-8">
                    <div>
                        <h1 className="text-2xl font-bold">Bem vindo, {auth.user.name.split(' ')[0] as string}! 👋</h1>
                        <p className="text-md text-muted-foreground">
                            {s.total === 0
                                ? 'Você ainda não registrou nenhuma reclamação. Que tal começar agora?'
                                : pendingResponses > 0
                                  ? `Você tem ${pendingResponses} reclamação(ões) aguardando sua avaliação.`
                                  : `Você tem ${s.in_progress} reclamação(ões) em andamento.`}
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('complaints.create')}
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
                    <div className="border-border bg-primary-foreground col-span-1 rounded-xl border p-6 lg:col-span-2">
                        <div className="border-border flex items-center justify-between border-b pb-2">
                            <div>
                                <h2 className="text-xl font-bold">Atividade recente</h2>
                                <p className="text-md text-muted-foreground">Suas últimas reclamações</p>
                            </div>
                            <Link href={route('complaints.index')} className="text-sm text-blue-500 hover:underline">
                                Ver todas →
                            </Link>
                        </div>

                        {recentItems.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                                <FileWarning className="text-muted-foreground/60 h-10 w-10" />
                                Você ainda não enviou nenhuma reclamação.
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-3">
                                {recentItems.map((c) => (
                                    <Link
                                        href={route('complaints.show', c.id)}
                                        key={c.id}
                                        className="border-border hover:bg-muted/40 flex flex-row items-center justify-between gap-4 rounded-lg border p-3 transition-colors"
                                    >
                                        <div className="bg-blue-100 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                                            <FileWarning className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{c.title}</p>
                                            <p className="text-muted-foreground flex items-center gap-1 text-xs">
                                                <MapPin className="h-3 w-3" />
                                                {c.neighborhood?.name || c.district || 'Sem bairro'}
                                                <span className="mx-1">•</span>
                                                <Clock className="h-3 w-3" />
                                                {formatRelativeTime(c.created_at)}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(c.status?.id)}`}>
                                            {c.status?.name || '—'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                Novidades
                                {noveltyTotal > 0 && (
                                    <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                                        {noveltyTotal}
                                    </span>
                                )}
                            </h2>
                        </div>
                        <p className="text-muted-foreground mt-2 text-xs">
                            Reclamações com atualizações desde a última vez que você as abriu.
                        </p>

                        {noveltyList.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center text-sm">
                                <Bell className="text-muted-foreground/60 h-10 w-10" />
                                Nenhuma novidade nas suas reclamações.
                            </div>
                        ) : (
                            <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                                {noveltyList.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={route('complaints.show', c.id)}
                                        className="border-border hover:bg-muted/40 flex w-full flex-col gap-1 rounded-lg border border-blue-500/60 bg-blue-500/5 p-3 text-left transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="text-blue-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">#{c.id} · {c.title}</p>
                                                {c.latest_novelty && <p className="text-muted-foreground text-xs line-clamp-2">{c.latest_novelty}</p>}
                                            </div>
                                            <span className="bg-blue-600 mt-1 h-2 w-2 flex-shrink-0 rounded-full" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="border-border bg-primary-foreground rounded-xl border p-6 lg:col-span-3">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                Sua cidade no ranking
                            </h2>
                            <p className="text-md text-muted-foreground">Como sua cidade está indo</p>
                        </div>

                        {cityRanking ? (
                            <div className="mt-4 flex flex-col gap-4">
                                <div>
                                    <p className="text-foreground text-lg font-semibold">{cityRanking.city.name}</p>
                                    <p className="text-muted-foreground text-xs">{cityRanking.city.state.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border-border rounded-lg border p-3 text-center">
                                        <p className="text-muted-foreground text-xs">Posição Brasil</p>
                                        <p className="text-2xl font-bold">{cityRanking.rank ?? '—'}º</p>
                                    </div>
                                    <div className="border-border rounded-lg border p-3 text-center">
                                        <p className="text-muted-foreground text-xs">Posição Estado</p>
                                        <p className="text-2xl font-bold">{cityRanking.rank_state ?? '—'}º</p>
                                    </div>
                                </div>
                                <div className="border-border rounded-lg border p-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Resolução</span>
                                        <span className="font-semibold">{cityRanking.resolution ?? 0}%</span>
                                    </div>
                                    <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${Math.min(100, cityRanking.resolution ?? 0)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <FileWarning className="h-3 w-3" />
                                        {cityRanking.total_complaints} reclamações
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3" />
                                        {cityRanking.solved_complaints} resolvidas
                                    </div>
                                </div>
                                <Link
                                    href={route('ranking.city', {
                                        stateUf: cityRanking.city.state.uf?.toLowerCase() ?? '',
                                        citySlug: cityRanking.city.slug,
                                    })}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Ver detalhes no ranking →
                                </Link>
                            </div>
                        ) : (
                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                                <Award className="text-muted-foreground/60 h-10 w-10" />
                                Cadastre sua cidade no perfil para acompanhar o ranking.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
