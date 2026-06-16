import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, Search, SearchX, Trophy } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { type ReactNode, useEffect, useRef, useState } from 'react';

/**
 * PageShell precisa ficar FORA do componente Ranking — caso contrário,
 * o React cria um tipo de componente novo a cada renderização (referência
 * muda), desmontando o input de busca e fazendo perder foco a cada tecla.
 */
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
                <Head title="Ranking" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>
            </AppLayout>
        );
    }
    return (
        <GuestLayout className="mx-auto min-h-[calc(100vh-7.5rem)] max-w-7xl py-8">
            <Head title="Ranking" />
            {children}
        </GuestLayout>
    );
}

type RankingProps = {
    rank: number;
    city: string;
    state: string;
    complaints: number;
    resolved: number;
    rate: string;
    score: number;
};

export default function Ranking() {
    const { ranking, state, city, first5, top5States, filters, period, auth } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search || '');
    const isAuthenticated = !!auth?.user;
    const states5: Array<{ id: number; uf: string; name: string; avg_resolution: number; total_complaints: number }> =
        top5States || [];

    const monthLabel = period
        ? new Date(period.year, period.month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : null;

    // Busca em tempo real com debounce de 300ms (padrão do projeto)
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            const params = search.trim() ? { search: search.trim() } : {};
            router.get(route('ranking.index'), params, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Ranking',
            href: '/ranking',
        },
    ];

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-400 text-yellow-900';
            case 2:
                return 'bg-slate-400 text-slate-900';
            case 3:
                return 'bg-orange-400 text-orange-900';
            default:
                return 'bg-primary text-primary-foreground';
        }
    };

    return (
        <PageShell isAuthenticated={isAuthenticated} breadcrumbs={breadcrumbs}>
            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
                <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-2">
                    {!city && (
                        <div className="border-border flex items-center gap-3 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900">
                            <Search size={18} className="text-muted-foreground flex-shrink-0" />
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Digite o nome da cidade…"
                                className="w-full"
                            />
                        </div>
                    )}

                    <div className="border-border flex flex-col gap-4 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900">
                        {(ranking?.data || []).length === 0 && (
                            <div className="border-border flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-12 text-center">
                                <SearchX size={32} className="text-muted-foreground/60" />
                                <h3 className="text-foreground text-lg font-medium">Nenhuma cidade encontrada</h3>
                                <p className="text-muted-foreground text-sm">
                                    {search ? (
                                        <>Não encontramos resultados para "<span className="text-foreground font-medium">{search}</span>".</>
                                    ) : (
                                        'Não há cidades no ranking deste período.'
                                    )}
                                </p>
                            </div>
                        )}
                        {(ranking?.data || []).map((item: any, index: number) => (
                            <Link
                                href={route('cities.show', { stateUf: item.city.state.uf.toLowerCase(), citySlug: item.city.slug })}
                                key={item.id}
                                className="bg-card border-border bg-primary-foreground relative flex w-full cursor-pointer flex-col gap-4 rounded-lg border p-4 transition-all hover:scale-101 hover:shadow-lg sm:flex-row sm:items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold ${getMedalColor(state ? item.rank_state : city ? 1 : item.rank)}`}
                                    >
                                        {state && !city ? item.rank_state : item.rank}
                                    </div>

                                    <div className="d-block sm:hidden">
                                        <h3 className="text-foreground text-lg font-bold">{item.city.name}</h3>
                                        <p className="text-muted-foreground text-sm">{item.city.state.name}</p>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <div className="hidden sm:block">
                                        <h3 className="text-foreground text-lg font-bold">{item.city.name}</h3>
                                        <p className="text-muted-foreground text-sm">{item.city.state.name}</p>
                                    </div>

                                    <div className="text-muted-foreground mt-0 flex items-center gap-4 text-xs sm:mt-1">
                                        <span>
                                            Reclamações: <span className="text-foreground font-semibold">{item.total_complaints || 0}</span>
                                        </span>
                                        <span>
                                            Resolvidas: <span className="text-foreground font-semibold">{item.solved_complaints || 0}</span>
                                        </span>
                                        {state && !city && (
                                            <span>
                                                Brasil: <span className="text-foreground font-semibold">{item.rank}º</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 sm:text-right">
                                    <p className="text-primary text-3xl font-bold">{item.resolution || 0}</p>
                                    <p className="text-muted-foreground -mt-1 text-sm">pontos</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {!city && ranking.links.length > 3 && (
                        <div className="border-border flex items-center justify-between gap-2 rounded-lg border bg-gray-100 p-4 text-sm dark:bg-zinc-900">
                            <button
                                onClick={() => ranking.prev_page_url && router.get(ranking.prev_page_url, {}, { preserveScroll: true })}
                                disabled={!ranking.prev_page_url}
                                className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden sm:block">Anterior</span>
                            </button>

                            {/* Desktop: janela de páginas (esconde Previous/Next, mantém ellipsis) */}
                            <div className="hidden items-center gap-2 sm:flex">
                                {ranking.links.slice(1, -1).map((link: any, index: number) => {
                                    const isEllipsis = !link.url && link.label.includes('...');
                                    if (isEllipsis) {
                                        return (
                                            <span key={index} className="text-muted-foreground px-1">
                                                …
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={index}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            className={`h-8 w-8 rounded-md text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted disabled:opacity-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Mobile: só indicador "x / y" */}
                            <div className="text-muted-foreground sm:hidden">
                                <span className="font-medium">{ranking.current_page}</span>
                                <span className="mx-1">/</span>
                                <span>{ranking.last_page}</span>
                            </div>

                            <button
                                onClick={() => ranking.next_page_url && router.get(ranking.next_page_url, {}, { preserveScroll: true })}
                                disabled={!ranking.next_page_url}
                                className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                <span className="hidden sm:block">Próxima</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Solicitação de acesso (botão; leva à página /solicitation-form) */}
                    {!city && (
                        <div className="border-border flex flex-col items-start gap-3 rounded-xl border bg-gray-100 p-5 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-foreground text-xl font-bold">É responsável por uma cidade?</h3>
                                <p className="text-muted-foreground text-sm">
                                    Solicite o acesso ao painel de gestão da sua prefeitura para responder às reclamações dos cidadãos.
                                </p>
                            </div>
                            <Link
                                href={route('solicitation-form.index')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block flex-shrink-0 cursor-pointer rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                            >
                                Solicitar acesso
                            </Link>
                        </div>
                    )}
                </div>

                <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-1">
                    <div className="border-border rounded-lg border bg-gray-100 p-4 dark:bg-zinc-900">
                        <h3 className="text-foreground p-inputtext flex items-center gap-1 truncate p-2.5 text-lg font-bold">
                            <MapPin size={20} className="mr-1 text-red-400" />
                            <Link href={route('ranking.index')} className="hover:underline">
                                Brasil
                            </Link>
                            {state && (
                                <>
                                    <ChevronRight size={20} className="text-red-400" />
                                    <Link href={route('ranking.state', state?.uf.toLowerCase())} className="hover:underline">
                                        {state?.name}
                                    </Link>
                                </>
                            )}
                            {city && (
                                <>
                                    <ChevronRight size={20} className="text-red-400" />
                                    <Link
                                        href={route('ranking.city', {
                                            stateUf: state?.uf,
                                            citySlug: city?.slug,
                                        })}
                                        className="truncate hover:underline"
                                    >
                                        {city?.name}
                                    </Link>
                                </>
                            )}
                        </h3>
                    </div>

                    <div className="border-border rounded-lg border bg-gray-100 p-4 dark:bg-zinc-900">
                        <div className="border-border bg-primary-foreground flex flex-col gap-1 rounded-lg border p-4">
                            <h3 className="text-foreground flex items-center gap-2 text-xl font-bold">
                                <Trophy size={20} className="text-yellow-400" />
                                Top 5 Cidades
                            </h3>
                            {monthLabel && (
                                <p className="text-muted-foreground text-sm first-letter:uppercase">
                                    {monthLabel}
                                </p>
                            )}
                        </div>

                        <div className="border-border bg-primary-foreground mt-3 flex flex-col gap-2 rounded-lg border p-3">
                            {(first5 || []).map((rank: any) => (
                                <Link
                                    key={rank.id}
                                    href={route('ranking.city', {
                                        stateUf: rank.city.state.uf.toLowerCase(),
                                        citySlug: rank.city.slug,
                                    })}
                                    className="hover:bg-muted/40 -mx-1 flex items-center gap-3 rounded-md px-1 py-1.5 transition-colors"
                                >
                                    <div
                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${getMedalColor(rank.rank)}`}
                                    >
                                        {rank.rank}
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <p className="text-foreground truncate text-sm font-semibold">{rank.city.name}</p>
                                        <p className="text-muted-foreground truncate text-xs">{rank.city.state.name}</p>
                                    </div>
                                    <p className="text-foreground text-sm font-bold">{rank.resolution || 0}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {states5.length > 0 && (
                        <div className="border-border rounded-lg border bg-gray-100 p-4 dark:bg-zinc-900">
                            <div className="border-border bg-primary-foreground flex flex-col gap-1 rounded-lg border p-4">
                                <h3 className="text-foreground flex items-center gap-2 text-xl font-bold">
                                    <Trophy size={20} className="text-emerald-400" />
                                    Top 5 Estados
                                </h3>
                                {monthLabel && <p className="text-muted-foreground text-sm first-letter:uppercase">{monthLabel}</p>}
                            </div>

                            <div className="border-border bg-primary-foreground mt-3 flex flex-col gap-2 rounded-lg border p-3">
                                {states5.map((st, idx) => (
                                    <Link
                                        key={st.id}
                                        href={route('ranking.state', { stateUf: st.uf.toLowerCase() })}
                                        className="hover:bg-muted/40 -mx-1 flex items-center gap-3 rounded-md px-1 py-1.5 transition-colors"
                                    >
                                        <div
                                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${getMedalColor(idx + 1)}`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                            <p className="text-foreground truncate text-sm font-semibold">{st.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {st.total_complaints} reclamações
                                            </p>
                                        </div>
                                        <p className="text-foreground text-sm font-bold">{st.avg_resolution}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
