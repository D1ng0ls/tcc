import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, Search, Trophy } from 'lucide-react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

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
    const { ranking, state, city, first5, filters } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search || '');

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
        <GuestLayout className="mx-auto min-h-[calc(100vh-7.5rem)] max-w-7xl py-8">
            <Head title="Ranking" />

            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
                <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-2">
                    {!city && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get(route('ranking.index'), { search }, { preserveState: true });
                            }}
                            className="border-border flex gap-4 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900"
                        >
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Digite para buscar..."
                                className="w-full"
                            />
                            <Button>
                                <Search />
                            </Button>
                        </form>
                    )}

                    <div className="border-border flex flex-col gap-4 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900">
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
                        <div className="border-border flex items-center justify-between rounded-lg border bg-gray-100 p-4 text-sm dark:bg-zinc-900">
                            <button
                                onClick={() => ranking.prev_page_url && router.get(ranking.prev_page_url, {}, { preserveScroll: true })}
                                disabled={!ranking.prev_page_url}
                                className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden sm:block">Anterior</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {ranking.links.map((link: any, index: number) => (
                                    <button
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        className={`h-8 w-8 rounded-md transition-colors ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    />
                                ))}
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
                </div>

                <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-1">
                    <div className="border-border sticky rounded-lg border bg-gray-100 p-4 dark:bg-zinc-900">
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

                    <div className="border-border sticky rounded-lg border bg-gray-100 p-4 dark:bg-zinc-900">
                        <h3 className="text-foreground border-border bg-primary-foreground flex items-center gap-2 rounded-lg border p-4 text-xl font-bold">
                            <Trophy size={20} className="text-yellow-400" />
                            Top 5 Cidades
                        </h3>

                        <div className="border-border bg-primary-foreground mt-4 flex flex-col gap-5 rounded-lg border p-4">
                            {(first5 || []).map((rank: any, index: number) => (
                                <div key={rank.id} className="flex items-center gap-4">
                                    <div
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${getMedalColor(rank.rank)}`}
                                    >
                                        {rank.rank}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-foreground font-semibold">{rank.city.name}</p>
                                        <p className="text-muted-foreground text-xs">{rank.city.state.name}</p>
                                    </div>
                                    <p className="text-foreground font-bold">{rank.resolution || 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
