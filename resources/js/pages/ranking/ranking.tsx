import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Trophy, Search, ChevronLeft, ChevronRight, Pin, MapPin } from 'lucide-react';
import { InputText } from 'primereact/inputtext';

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
    
    const { ranking } = usePage().props as any;

    const rankingData: RankingProps[] = [
        {
            rank: 1,
            city: 'São Caetano do Sul',
            state: 'São Paulo',
            complaints: 45,
            resolved: 44,
            rate:
                '97.8%',
            score: 98.5
        },
        {
            rank: 2,
            city: 'Águas de São Pedro',
            state: 'São Paulo',
            complaints: 12,
            resolved: 12,
            rate:
                '100.0%',
            score: 97.2
        },
        {
            rank: 3,
            city: 'Florianópolis',
            state: 'Santa Catarina',
            complaints: 234,
            resolved: 224,
            rate:
                '95.7%',
            score: 95.8
        },
        {
            rank: 4,
            city: 'Santos',
            state: 'São Paulo',
            complaints: 189,
            resolved: 178,
            rate:
                '94.2%',
            score: 94.5
        },
        {
            rank: 5,
            city: 'Vitória',
            state: 'Espírito Santo',
            complaints: 98,
            resolved: 91,
            rate:
                '92.9%',
            score: 93.7
        }
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Ranking',
            href: '/ranking',
        },
    ];

    const topCities = rankingData.slice(0, 5);

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-yellow-400 text-yellow-900';
            case 2: return 'bg-slate-400 text-slate-900';
            case 3: return 'bg-orange-400 text-orange-900';
            default: return 'bg-primary text-primary-foreground';
        }
    };

    return (
        <GuestLayout className='max-w-7xl mx-auto py-8'>
            <Head title="Ranking" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                <div className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex gap-4">
                        <InputText placeholder="Digite para buscar..." className="w-full" />
                    </div>

                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex flex-col gap-4">
                        {rankingData.map((item) => (
                            <div key={item.rank} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 relative w-full bg-card border border-border rounded-lg bg-primary-foreground">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-xl font-bold ${getMedalColor(item.rank)}`}>
                                        {item.rank}
                                    </div>

                                    <div className="d-block sm:hidden">
                                        <h3 className="text-lg font-bold text-foreground">{item.city}</h3>
                                        <p className="text-sm text-muted-foreground">{item.state}</p>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <div className="hidden sm:block">
                                        <h3 className="text-lg font-bold text-foreground">{item.city}</h3>
                                        <p className="text-sm text-muted-foreground">{item.state}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0 sm:mt-1">
                                        <span>Reclamações: <span className="font-semibold text-foreground">{item.complaints}</span></span>
                                        <span>Resolvidas: <span className="font-semibold text-foreground">{item.resolved}</span></span>
                                        <span>Taxa: <span className="font-semibold text-foreground">{item.rate}</span></span>
                                    </div>
                                </div>
                                <div className="sm:text-right flex-shrink-0">
                                    <p className="text-3xl font-bold text-primary">{item.score.toFixed(1)}</p>
                                    <p className="text-sm text-muted-foreground -mt-1">pontos</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 flex items-center justify-between text-sm bg-gray-100 dark:bg-zinc-900 border border-border rounded-lg">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground bg-card border border-border bg-primary-foreground hover:bg-muted transition-colors" disabled>
                            <ChevronLeft size={16} />
                            <span className="hidden sm:block">Anterior</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(page => (
                                <button key={page} className={`w-8 h-8 rounded-md transition-colors ${page === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground bg-card border border-border bg-primary-foreground hover:bg-muted transition-colors">
                            <span className="hidden sm:block">Próxima</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6 order-1 lg:order-2">
                    <div className="border border-border rounded-lg bg-gray-100 dark:bg-zinc-900 p-4 sticky">
                        <h3 className="flex items-center gap-1 text-lg font-bold text-foreground p-2.5 truncate p-inputtext">
                            <MapPin size={20} className="text-red-400 mr-1" />
                            Brasil
                            {ranking?.state && (
                                <>
                                    <ChevronRight size={20} className="text-red-400" />
                                    <Link href={route('ranking.state', ranking?.state?.uf)} className="hover:underline">{ranking?.state?.name}</Link>
                                </>
                            )}
                            {ranking?.city && (
                                <>
                                    <ChevronRight size={20} className="text-red-400" />
                                    <Link
                                        href={route('ranking.city', {
                                            stateUf: ranking?.state?.uf,
                                            citySlug: ranking?.city?.slug,
                                        })}
                                        className="truncate hover:underline"
                                    >
                                        {ranking?.city?.name}
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
                            {topCities.map((city) => (
                                <div key={city.rank} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${getMedalColor(city.rank)}`}>
                                        {city.rank}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-foreground">{city.city}</p>
                                        <p className="text-xs text-muted-foreground">{city.state}</p>
                                    </div>
                                    <p className="font-bold text-foreground">{city.score.toFixed(1)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
