import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Trophy, Search, ChevronLeft, ChevronRight, Pin, MapPin } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from 'primereact/button';

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
            case 1: return 'bg-yellow-400 text-yellow-900';
            case 2: return 'bg-slate-400 text-slate-900';
            case 3: return 'bg-orange-400 text-orange-900';
            default: return 'bg-primary text-primary-foreground';
        }
    };

    return (
        <GuestLayout className='max-w-7xl mx-auto py-8 min-h-[calc(100vh-7.5rem)]'>
            <Head title="Ranking" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                <div className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-1">
                    {!city && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get(route('ranking.index'), { search }, { preserveState: true });
                            }}
                            className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex gap-4"
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

                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex flex-col gap-4">
                        {(ranking?.data || []).map((item: any, index: number) => (
                            <Link href={route('city.show', { stateUf: item.city.state.uf.toLowerCase(), citySlug: item.city.slug })} key={item.id} className="hover:shadow-lg transition-all hover:scale-101 cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center gap-4 relative w-full bg-card border border-border rounded-lg bg-primary-foreground">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-xl font-bold ${getMedalColor(state ? item.rank_state : city ? 1 : item.rank)}`}>
                                        {state && !city ? item.rank_state : item.rank}
                                    </div>

                                    <div className="d-block sm:hidden">
                                        <h3 className="text-lg font-bold text-foreground">{item.city.name}</h3>
                                        <p className="text-sm text-muted-foreground">{item.city.state.name}</p>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <div className="hidden sm:block">
                                        <h3 className="text-lg font-bold text-foreground">{item.city.name}</h3>
                                        <p className="text-sm text-muted-foreground">{item.city.state.name}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0 sm:mt-1">
                                        <span>Reclamações: <span className="font-semibold text-foreground">{item.total_complaints}</span></span>
                                        <span>Resolvidas: <span className="font-semibold text-foreground">{item.solved_complaints}</span></span>
                                        {(state && !city) && <span>Brasil: <span className="font-semibold text-foreground">{item.rank}º</span></span>}
                                    </div>
                                </div>
                                <div className="sm:text-right flex-shrink-0">
                                    <p className="text-3xl font-bold text-primary">{item.resolution || 0}</p>
                                    <p className="text-sm text-muted-foreground -mt-1">pontos</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {(!city && ranking.links.length > 3) && (
                        <div className="p-4 flex items-center justify-between text-sm bg-gray-100 dark:bg-zinc-900 border border-border rounded-lg">
                            <button
                                onClick={() => ranking.prev_page_url && router.get(ranking.prev_page_url, {}, { preserveScroll: true })}
                                disabled={!ranking.prev_page_url}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground bg-card border border-border bg-primary-foreground hover:bg-muted transition-colors disabled:opacity-50"
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
                                        className={`w-8 h-8 rounded-md transition-colors ${link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => ranking.next_page_url && router.get(ranking.next_page_url, {}, { preserveScroll: true })}
                                disabled={!ranking.next_page_url}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground bg-card border border-border bg-primary-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                <span className="hidden sm:block">Próxima</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6 order-1 lg:order-2">
                    <div className="border border-border rounded-lg bg-gray-100 dark:bg-zinc-900 p-4 sticky">
                        <h3 className="flex items-center gap-1 text-lg font-bold text-foreground p-2.5 truncate p-inputtext">
                            <MapPin size={20} className="text-red-400 mr-1" />
                            <Link href={route('ranking.index')} className="hover:underline">Brasil</Link>
                            {state && (
                                <>
                                    <ChevronRight size={20} className="text-red-400" />
                                    <Link href={route('ranking.state', state?.uf.toLowerCase())} className="hover:underline">{state?.name}</Link>
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

                    <div className="border border-border rounded-lg bg-gray-100 dark:bg-zinc-900 p-4 sticky">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-foreground p-4 border border-border rounded-lg bg-primary-foreground">
                            <Trophy size={20} className="text-yellow-400" />
                            Top 5 Cidades
                        </h3>

                        <div className="mt-4 flex flex-col gap-5 p-4 border border-border rounded-lg bg-primary-foreground">
                            {(first5 || []).map((rank: any, index: number) => (
                                <div key={rank.id} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${getMedalColor(rank.rank)}`}>
                                        {rank.rank}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-foreground">{rank.city.name}</p>
                                        <p className="text-xs text-muted-foreground">{rank.city.state.name}</p>
                                    </div>
                                    <p className="font-bold text-foreground">{rank.resolution || 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
