import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Building2, CheckCheck, ExternalLink, FilePenLine, Search, Star, Users } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';

type WelcomeStats = {
    cities: number;
    complaints: number;
    resolved: number;
    users: number;
};

type Top3Ranking = {
    id: number;
    rank: number;
    total_complaints: number;
    solved_complaints: number;
    resolution: number | null;
    city: {
        name: string;
        slug: string;
        state: { name: string; uf: string };
    };
};

type WelcomePageProps = SharedData & {
    stats: WelcomeStats;
    top3: Top3Ranking[];
};

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

const formatRate = (total: number, solved: number) => {
    if (total <= 0) return '—';
    return `${Math.round((solved / total) * 100)}%`;
};

export default function Welcome() {
    const { auth, stats: statsData, top3 } = usePage<WelcomePageProps>().props;

    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [results, setResults] = useState<{
        states: { id: number; uf: string; name: string }[];
        cities: { id: number; uf: string; name: string; slug: string }[];
    } | null>(null);

    const stats = [
        {
            icon: Building2,
            value: formatNumber(statsData.cities),
            label: 'Cidades Cadastradas',
        },
        {
            icon: FilePenLine,
            value: formatNumber(statsData.complaints),
            label: 'Reclamações Registradas',
        },
        {
            icon: CheckCheck,
            value: formatNumber(statsData.resolved),
            label: 'Problemas Resolvidos',
        },
        {
            icon: Users,
            value: formatNumber(statsData.users),
            label: 'Cidadãos Ativos',
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

    const steps = [
        {
            number: '1',
            title: 'Crie sua Conta',
            description: 'Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades da plataforma.',
        },
        {
            number: '2',
            title: 'Registre o Problema',
            description: 'Descreva o problema urbano, adicione fotos e a localização exata.',
        },
        {
            number: '3',
            title: 'Acompanhe o Processo',
            description: 'Receba atualizações em tempo real sobre o andamento da sua reclamação.',
        },
        {
            number: '4',
            title: 'Avalie a Solução',
            description: 'Após a resolução, avalie o atendimento e ajude outras pessoas.',
        },
    ];

    useEffect(() => {
        if (!search || search.length <= 2) return;

        setLoading(true);

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(
                    route('ranking.find', {
                        search: search,
                    }),
                );
                setResults(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Erro na busca', error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const id = hash.slice(1);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const target = document.getElementById(id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }, []);

    return (
        <>
            <GuestLayout className="mx-auto max-w-7xl py-8">
                <Head title="Welcome" />

                <div className="border-border bg-primary-foreground mx-2 flex max-w-full items-center justify-center rounded-3xl border p-8 text-center sm:p-16 lg:p-24 dark:bg-zinc-900 dark:text-white">
                    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Melhores Cidades no Cidade Inteligente</h1>

                        <p className="text-muted-foreground text-lg">Veja quais são as cidades mais confiáveis de cada categoria...</p>

                        <div className="relative w-full">
                            {' '}
                            <div className="border-border dark:bg-primary-foreground focus-within:ring-primary/50 mt-4 flex w-full items-center justify-between gap-2 rounded-full border bg-white p-2 transition-all focus-within:ring-2">
                                <Search size={20} className="ml-3 flex-shrink-0 text-gray-400" />

                                <InputText
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Busque por cidades ou estados..."
                                    className="w-full !border-none !bg-transparent focus:!ring-0"
                                />

                                {loading && <div className="border-primary mr-2 h-5 w-5 animate-spin rounded-full border-b-2"></div>}

                                <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 rounded-full px-6 py-2.5 font-semibold transition-colors">
                                    Buscar
                                </button>
                            </div>
                            {search && !loading && results && (
                                <div className="border-border absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-xl dark:bg-zinc-800">
                                    <ul className="flex max-h-60 flex-col overflow-y-auto p-2 text-left text-sm">
                                        {results.states.map((state) => (
                                            <Link
                                                key={`st-${state.id}`}
                                                className="text-primary hover:bg-muted flex flex-row justify-between rounded-xl p-2 font-bold"
                                                href={route('ranking.state', {
                                                    stateUf: state?.uf,
                                                })}
                                            >
                                                <span>{state.name}</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        ))}

                                        {results.cities.map((city) => (
                                            <Link
                                                key={`ct-${city.id}`}
                                                className="hover:bg-muted flex flex-row justify-between rounded-xl p-2"
                                                href={route('ranking.city', {
                                                    stateUf: city?.uf,
                                                    citySlug: city?.slug,
                                                })}
                                            >
                                                <span>{city.name}</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!results ||
                                (search && !loading && results && results.cities.length <= 0 && results.states.length <= 0 && (
                                    <div className="border-border absolute z-10 mt-2 w-full rounded-2xl border bg-white p-4 shadow-xl dark:bg-zinc-800">
                                        <p className="text-muted-foreground">
                                            {search.length <= 2 ? (
                                                'Digite pelo menos 3 letras para pesquisar'
                                            ) : (
                                                <>Nenhum resultado encontrado para "{search}"</>
                                            )}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card py-12 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="flex flex-col items-center">
                                        <Icon size={40} className="text-primary" />
                                        <p className="text-foreground mt-4 text-4xl font-bold tracking-tight">+ {stat.value}</p>
                                        <p className="text-muted-foreground mt-2 text-base">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div id="cidades-destaque" className="bg-background scroll-mt-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Cidades em Destaque</h2>
                            <p className="text-muted-foreground mt-4 text-lg leading-8">
                                Conheça as cidades com melhor índice de resolução de problemas urbanos.
                            </p>
                        </div>

                        <div className="mx-auto mt-10 grid max-w-none grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-3">
                            {top3.map((item) => (
                                <Link
                                    href={route('cities.show', {
                                        stateUf: item.city.state.uf.toLowerCase(),
                                        citySlug: item.city.slug,
                                    })}
                                    key={item.id}
                                    className="bg-card border-primary hover:shadow-primary/20 flex flex-col gap-y-4 rounded-2xl border-l-4 p-6 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-foreground text-xl font-semibold">{item.city.name}</h3>
                                            <p className="text-muted-foreground text-sm">{item.city.state.name}</p>
                                        </div>
                                        <div
                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${getMedalColor(item.rank)}`}
                                        >
                                            {item.rank}
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                                        <Star size={14} />
                                        {item.resolution ?? 0}
                                    </div>

                                    <div className="border-border flex justify-between border-t pt-4">
                                        <div className="text-center">
                                            <p className="text-foreground text-2xl font-bold">{formatNumber(item.total_complaints)}</p>
                                            <p className="text-muted-foreground text-xs">Reclamações</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-foreground text-2xl font-bold">{formatRate(item.total_complaints, item.solved_complaints)}</p>
                                            <p className="text-muted-foreground text-xs">Resolvidas</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div id="como-funciona" className="bg-card py-12 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Como Funciona</h2>
                            <p className="text-muted-foreground mt-4 text-lg leading-8">Sua voz pode transformar a cidade em poucos passos.</p>
                        </div>

                        <div className="mx-auto mt-12 grid max-w-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step) => (
                                <div key={step.number} className="flex flex-col items-center text-center">
                                    <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full">
                                        <span className="text-xl font-bold">{step.number}</span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-foreground text-lg leading-6 font-semibold">{step.title}</h3>
                                        <p className="text-muted-foreground mt-2 text-sm">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-border bg-primary-foreground mx-2 mb-16 flex max-w-full items-center justify-center rounded-3xl border text-center dark:bg-zinc-900">
                    <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">Pronto para fazer a diferença?</h2>

                        <p className="text-muted-foreground mt-4 text-lg leading-6">
                            Junte-se a milhares de cidadãos que já estão transformando suas cidades.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row">
                            <Link
                                href={route('register')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block w-[220px] flex-shrink-0 rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                            >
                                Criar conta grátis
                            </Link>

                            <Link
                                href={route('ranking.index')}
                                className="border-foreground text-foreground hover:bg-foreground dark:hover:text-primary-foreground inline-block w-[220px] rounded-lg border px-5 py-3 text-base font-semibold transition-colors hover:text-white dark:border-white dark:text-white"
                            >
                                Ver ranking completo
                            </Link>
                        </div>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
}
