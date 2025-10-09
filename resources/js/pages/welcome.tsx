import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search, Building2, FilePenLine, CheckCheck, Users, Star } from 'lucide-react';
import { useState } from 'react';

type CityCardProps = {
    rank: number;
    name: string;
    state: string;
    score: number;
    complaints: number;
    resolvedRate: string;
};

export default function Welcome() {

    const { auth } = usePage<SharedData>().props;

    const [search, setSearch] = useState('');

    const stats = [
        {
            icon: Building2,
            value: '500+',
            label: 'Cidades Cadastradas',
        },
        {
            icon: FilePenLine,
            value: '25.847',
            label: 'Reclamações Registradas',
        },
        {
            icon: CheckCheck,
            value: '18.234',
            label: 'Problemas Resolvidos',
        },
        {
            icon: Users,
            value: '12.560',
            label: 'Cidadãos Ativos',
        },
    ];

    const mockCities: CityCardProps[] = [
        { rank: 1, name: 'São Caetano do Sul', state: 'São Paulo', score: 98.5, complaints: 445, resolvedRate: '98%' },
        { rank: 2, name: 'Águas de São Pedro', state: 'São Paulo', score: 97.2, complaints: 212, resolvedRate: '97%' },
        { rank: 3, name: 'Florianópolis', state: 'Santa Catarina', score: 95.8, complaints: 834, resolvedRate: '96%' },
    ];

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-yellow-400 text-yellow-900';
            case 2: return 'bg-slate-400 text-slate-900';
            case 3: return 'bg-orange-400 text-orange-900';
            default: return 'bg-primary text-primary-foreground';
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

    return (
        <>
            <GuestLayout className='max-w-7xl mx-auto py-8'>
                
                <Head title="Welcome" />

                <div className="max-w-full flex items-center justify-center p-8 sm:p-16 lg:p-24 border border-border rounded-3xl bg-primary-foreground dark:bg-zinc-900 dark:text-white text-center mx-2">
                    <div className="flex flex-col items-center gap-6 max-w-2xl">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Melhores Cidades no Cidade Inteligente</h1>

                        <p className="text-lg text-muted-foreground">Veja quais são as cidades mais confiáveis de cada categoria. Explore nossa página e tome decisões importantes com mais segurança.</p>

                        <div className="w-full mt-4 p-2 flex items-center justify-between gap-2 border border-border bg-white dark:bg-primary-foreground rounded-full">
                            <Search size={20} className="ml-3 text-gray-400 flex-shrink-0" />
                            
                            <input 
                                type="text" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Busque por cidades, problemas ou bairros..." 
                                className="w-full border-none bg-transparent focus:ring-0 text-gray-800" 
                            />

                            <button className="flex-shrink-0 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-card py-12 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        {/* Grid responsivo para os 4 itens */}
                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 text-center">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="flex flex-col items-center">
                                        <Icon size={40} className="text-primary" />
                                        <p className="mt-4 text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
                                        <p className="mt-2 text-base text-muted-foreground">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-background">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        {/* Título da Seção */}
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Cidades em Destaque</h2>
                            <p className="mt-4 text-lg leading-8 text-muted-foreground">
                                Conheça as cidades com melhor índice de resolução de problemas urbanos.
                            </p>
                        </div>

                        {/* Grid Responsivo para os Cards */}
                        <div className="mx-auto mt-10 grid max-w-none grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-3">
                            {mockCities.map((city) => (
                                <div key={city.rank} className="flex flex-col gap-y-4 rounded-2xl bg-card p-6 border-l-4 border-primary shadow-lg transition-all hover:shadow-primary/20">
                                    {/* Topo do Card: Nomes e Ranking */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-foreground">{city.name}</h3>
                                            <p className="text-sm text-muted-foreground">{city.state}</p>
                                        </div>
                                        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${getMedalColor(city.rank)}`}>
                                            {city.rank}
                                        </div>
                                    </div>

                                    {/* Badge de Pontuação */}
                                    <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                                        <Star size={14} />
                                        {city.score.toFixed(1)}
                                    </div>

                                    {/* Estatísticas Finais */}
                                    <div className="flex justify-between border-t border-border pt-4">
                                        <div className='text-center'>
                                            <p className="text-2xl font-bold text-foreground">{city.complaints}</p>
                                            <p className="text-xs text-muted-foreground">Reclamações</p>
                                        </div>
                                        <div className='text-center'>
                                            <p className="text-2xl font-bold text-foreground">{city.resolvedRate}</p>
                                            <p className="text-xs text-muted-foreground">Resolvidas</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card py-12 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        {/* Título da Seção */}
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Como Funciona</h2>
                            <p className="mt-4 text-lg leading-8 text-muted-foreground">
                                Sua voz pode transformar a cidade em poucos passos.
                            </p>
                        </div>

                        {/* 2. LAYOUT RESPONSIVO COM GRID */}
                        <div className="mx-auto mt-12 grid max-w-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step) => (
                                <div key={step.number} className="flex flex-col items-center text-center">
                                    {/* 3. CÍRCULO ROXO COM O NÚMERO */}
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <span className="text-xl font-bold">{step.number}</span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold leading-6 text-foreground">{step.title}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-full flex items-center justify-center border border-border rounded-3xl bg-primary-foreground dark:bg-zinc-900 text-center mb-16 mx-2">
                    <div className="mx-auto max-w-2xl py-16 px-6 text-center sm:py-20 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight dark:text-white sm:text-4xl">Pronto para fazer a diferença?</h2>

                        <p className="mt-4 text-lg leading-6 text-muted-foreground">
                            Junte-se a milhares de cidadãos que já estão transformando suas cidades.
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-4 lg:flex-row flex-col">
                            <Link 
                                href={'#'} 
                                className="w-[220px] inline-block rounded-lg px-5 py-3 shadow-md flex-shrink-0 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Criar conta grátis
                            </Link>

                            <Link
                                href={'#'}
                                className="w-[220px] inline-block rounded-lg border border-foreground dark:border-white px-5 py-3 text-base font-semibold text-foreground dark:text-white hover:bg-foreground hover:text-white transition-colors dark:hover:text-primary-foreground"
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