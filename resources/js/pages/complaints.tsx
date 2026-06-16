import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { type ReactNode, useState } from 'react';

interface Filters {
    status: string | null;
    search: string;
}

const statusStyles = {
    1: { badge: 'bg-sky-100 text-sky-800', border: 'bg-sky-500' },
    2: { badge: 'bg-yellow-100 text-yellow-800', border: 'bg-yellow-300' },
    3: { badge: 'bg-purple-200 text-purple-700', border: 'bg-purple-500' },
    4: { badge: 'bg-green-100 text-green-800', border: 'bg-green-500' },
    5: { badge: 'bg-red-200 text-red-700', border: 'bg-red-500' },
    6: { badge: 'bg-stone-200 text-stone-700', border: 'bg-stone-500' },
};

/**
 * PageShell fora do componente para evitar remount do input a cada
 * tecla (causaria perder foco da busca).
 */
function PageShell({
    children,
    isAuthenticated,
    breadcrumbs,
    title,
}: {
    children: ReactNode;
    isAuthenticated: boolean;
    breadcrumbs: BreadcrumbItem[];
    title: string;
}) {
    if (isAuthenticated) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={title} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>
            </AppLayout>
        );
    }
    return (
        <GuestLayout className="mx-auto max-w-7xl py-8">
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>
        </GuestLayout>
    );
}

type PaginatedComplaints = {
    data: any[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function Complaints() {
    const { complaints, totals, status, auth, city, ranking } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    const paginated: PaginatedComplaints = complaints;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Ranking', href: '/ranking' },
        { title: city.state.name, href: `/ranking/${city.state.uf.toLowerCase()}` },
        { title: city.name, href: `/cities/${city.state.uf.toLowerCase()}/${city.slug}` },
    ];

    const [filters, setFilters] = useState<Filters>({ status: null, search: '' });

    const handleFilterChange = (field: keyof Filters, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const filteredComplaints = paginated.data.filter((c: any) => {
        let ok = true;
        if (filters.status && String(c.status_id) !== String(filters.status)) ok = false;
        if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) ok = false;
        return ok;
    });

    return (
        <PageShell
            isAuthenticated={isAuthenticated}
            breadcrumbs={breadcrumbs}
            title={`${city.name} - ${city.state.uf}`}
        >
            <div>
                <button
                    onClick={() => window.history.back()}
                    className="border-border bg-primary-foreground text-foreground hover:bg-muted hover:border-primary flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 font-semibold transition-all duration-200"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>
            </div>

            <div
                className={`border-border text-primary w-full rounded-xl border p-2 sm:p-6 lg:p-8 ${
                    ranking?.rank == 1
                        ? 'bg-linear-to-t from-amber-400 to-yellow-300 dark:from-amber-400 dark:to-amber-500'
                        : ranking?.rank == 2
                          ? 'bg-linear-to-t from-stone-200 to-slate-100 dark:from-stone-500 dark:to-slate-500'
                          : ranking?.rank == 3
                            ? 'bg-linear-to-t from-amber-500 to-orange-400 dark:from-amber-800 dark:to-yellow-800'
                            : 'bg-muted/50'
                }`}
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex items-center gap-4">
                            {city.municipality?.photo_url ? (
                                <img
                                    src={city.municipality.photo_url}
                                    alt={`Prefeitura de ${city.name}`}
                                    className="border-primary/40 bg-background h-16 w-16 flex-shrink-0 rounded-full border-2 object-cover shadow-md sm:h-20 sm:w-20"
                                />
                            ) : null}
                            <h1 className="text-center text-4xl font-bold tracking-tight sm:text-4xl">
                                {city.name} -{' '}
                                {ranking?.rank == 1 ? '🥇' : ranking?.rank == 2 ? '🥈' : ranking?.rank == 3 ? '🥉' : ranking?.rank + 'º'}
                            </h1>
                        </div>
                        <div className="flex justify-center gap-2">
                            <span className="bg-muted/50 block w-fit rounded-full px-3 py-1 text-sm font-medium">{city.state.uf}</span>
                        </div>
                    </div>

                    <div className="text-primary mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                        <div>
                            <p className="text-center text-3xl font-bold">{totals?.open ?? 0}</p>
                            <p className="text-center text-sm">Reclamações Abertas</p>
                        </div>
                        <div>
                            <p className="text-center text-3xl font-bold">{totals?.solved ?? ranking?.solved_complaints ?? 0}</p>
                            <p className="text-center text-sm">Reclamações Concluídas</p>
                        </div>
                        <div>
                            <p className="text-center text-3xl font-bold">{totals?.total ?? ranking?.total_complaints ?? 0}</p>
                            <p className="text-center text-sm">Total de Reclamações</p>
                        </div>
                        <div>
                            <p className="text-center text-3xl font-bold">{ranking?.resolution ?? 0}</p>
                            <p className="text-center text-sm">Pontos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-border flex gap-4 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900">
                <div className="flex w-full flex-col sm:w-1/3">
                    <label className="text-muted-foreground mb-1 text-sm font-medium">Status</label>
                    <Dropdown
                        value={filters.status}
                        options={status}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e: DropdownChangeEvent) => handleFilterChange('status', e.value)}
                        placeholder="Todos"
                        showClear
                        className="w-full"
                    />
                </div>

                <div className="flex w-full flex-col">
                    <label className="text-muted-foreground mb-1 text-sm font-medium">Buscar</label>
                    <InputText
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Digite para buscar..."
                        className="w-full"
                    />
                </div>
            </div>

            <div className="border-border flex flex-col gap-4 rounded-xl border bg-gray-100 p-4 dark:bg-zinc-900">
                {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint: any) => (
                        <div
                            key={complaint.id}
                            className="bg-card border-border bg-primary-foreground relative w-full rounded-lg border shadow-sm"
                        >
                            <div
                                className={`absolute top-0 left-0 h-2 w-full rounded-t-lg ${statusStyles[complaint.status_id as keyof typeof statusStyles]?.border}`}
                            />
                            <div className="p-6 pt-8">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">#{complaint.id}</span>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[complaint.status_id as keyof typeof statusStyles]?.badge}`}
                                    >
                                        {complaint.status?.name?.toUpperCase()}
                                    </span>
                                </div>

                                <h2 className="text-foreground text-2xl font-bold">{complaint.title}</h2>

                                <p className="text-muted-foreground mt-3">
                                    {complaint.description.length > 150
                                        ? complaint.description.substring(0, 150) + '...'
                                        : complaint.description}
                                </p>

                                <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        <span>{complaint.department?.municipality?.city?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-xs font-medium">
                                            {complaint.department?.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-border/50 mt-6 flex items-center gap-4 border-t pt-4">
                                    <Link href={route('complaints.show', complaint.id)}>
                                        <button className="text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-6 py-2 font-semibold transition-colors">
                                            Ver detalhes
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="border-border rounded-lg border-2 border-dashed py-12 text-center">
                        <h3 className="text-foreground text-lg font-medium">Nenhuma reclamação encontrada</h3>
                        <p className="text-muted-foreground">Tente ajustar os filtros.</p>
                    </div>
                )}

                {paginated.last_page > 1 && (
                    <div className="border-border mt-2 flex items-center justify-between rounded-lg border bg-gray-100 p-3 text-sm dark:bg-zinc-900">
                        <button
                            onClick={() => paginated.prev_page_url && router.get(paginated.prev_page_url, {}, { preserveScroll: true })}
                            disabled={!paginated.prev_page_url}
                            className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:block">Anterior</span>
                        </button>

                        <div className="text-muted-foreground">
                            <span className="font-medium">{paginated.current_page}</span>
                            <span className="mx-1">/</span>
                            <span>{paginated.last_page}</span>
                        </div>

                        <button
                            onClick={() => paginated.next_page_url && router.get(paginated.next_page_url, {}, { preserveScroll: true })}
                            disabled={!paginated.next_page_url}
                            className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                            <span className="hidden sm:block">Próxima</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="border-border flex max-w-full items-center justify-center rounded-xl border bg-gray-100 text-center dark:bg-zinc-900">
                <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">Pronto para fazer a diferença?</h2>
                    <p className="text-muted-foreground mt-4 text-lg leading-6">
                        Junte-se a milhares de cidadãos que já estão transformando suas cidades.
                    </p>

                    <div className="my-8 flex flex-col items-center justify-center gap-4 lg:flex-row">
                        {auth.user ? (
                            <Link
                                href={route('complaints.create')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block w-[220px] flex-shrink-0 rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                            >
                                Abrir nova reclamação
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block w-[220px] flex-shrink-0 rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                            >
                                Criar conta grátis
                            </Link>
                        )}

                        <Link
                            href={route('ranking.index')}
                            className="border-foreground text-foreground hover:bg-foreground dark:hover:text-primary-foreground inline-block w-[220px] rounded-lg border px-5 py-3 text-base font-semibold transition-colors hover:text-white dark:border-white dark:text-white"
                        >
                            Ver ranking completo
                        </Link>
                    </div>

                    {/* Só faz sentido solicitar acesso enquanto a prefeitura não estiver ativa */}
                    {!city.municipality?.active && (
                        <>
                            <hr />

                            <div className="mt-8">
                                <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-2xl dark:text-white">
                                    É responsável por essa cidade?
                                </h2>
                                <Link
                                    href={route('solicitation-form.index', { city_id: city.id })}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block w-[220px] flex-shrink-0 cursor-pointer rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                                >
                                    Solicitar acesso
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
