import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Clock, FileWarning, Hourglass, MapPin, Radar } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import SolicitationForm from '../components/solicitation-form';

interface Filters {
    status: string | null;
    category: string | null;
    period: Date | null;
    search: string;
}

type ComplaintProps = {
    id: number;
    title: string;
    status: 'Aberto' | 'Em andamento' | 'Fechado';
    category: string;
    description: string;
    location: string;
    time: string;
};

const statusStyles = {
    1: {
        badge: 'bg-sky-100 text-sky-800',
        border: 'bg-sky-500',
    },
    2: {
        badge: 'bg-yellow-100 text-yellow-800',
        border: 'bg-yellow-300',
    },
    3: {
        badge: 'bg-purple-200 text-purple-700',
        border: 'bg-purple-500',
    },
    4: {
        badge: 'bg-green-100 text-green-800',
        border: 'bg-green-500',
    },
    5: {
        badge: 'bg-red-200 text-red-700',
        border: 'bg-red-500',
    },
    6: {
        badge: 'bg-stone-200 text-stone-700',
        border: 'bg-stone-500',
    },
};

export default function Complaints() {
    const { complaints, status, auth, city, ranking } = usePage().props as any;
    const [open, setOpen] = useState<boolean>(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Minhas Reclamações',
            href: '/complaints',
        },
    ];

    const [filters, setFilters] = useState<Filters>({
        status: null,
        category: null,
        period: null,
        search: '',
    });

    const handleFilterChange = (field: keyof Filters, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const filteredComplaints = complaints.filter((c: ComplaintProps & { status_id: number }) => {
        let ok = true;

        if (filters.status && c.status_id.toLocaleString() !== filters.status) {
            ok = false;
        }

        if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) {
            ok = false;
        }

        if (filters.period) {
            const created = new Date(c.time);
            ok = created.toDateString() === filters.period.toDateString();
        }

        return ok;
    });

    const cards = [
        {
            title: 'Total de reclamações',
            value: complaints.length,
            icon: FileWarning,
            color: 'bg-blue-500',
        },
        {
            title: 'Em andamento',
            value: complaints.filter((c: any) => c.status_id === 2).length,
            icon: Hourglass,
            color: 'bg-yellow-500',
        },
        {
            title: 'Resolvidos',
            value: complaints.filter((c: any) => c.status_id === 4).length,
            icon: Check,
            color: 'bg-green-500',
        },
        {
            title: 'Abertos',
            value: complaints.filter((c: any) => c.status_id === 1).length,
            icon: Radar,
            color: 'bg-violet-500',
        },
    ];

    return (
        <GuestLayout className="mx-auto max-w-7xl py-8">
            <Head title="Reclamações" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div
                    className={`border-border text-primary w-full rounded-xl border p-2 sm:p-6 lg:p-8 ${
                        ranking?.rank == 1
                            ? 'bg-linear-to-t from-amber-400 to-yellow-300 dark:from-amber-400 dark:to-amber-500'
                            : ranking?.rank == 2
                              ? 'bg-linear-to-t from-stone-200 to-slate-100 dark:from-stone-500 dark:to-slate-500'
                              : ranking?.rank == 3
                                ? 'bg-linear-to-t from-amber-500 to-orange-400 dark:from-amber-800 dark:to-yellow-800'
                                : 'bg-muted/50'
                    } `}
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="flex items-center justify-center gap-4">
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
                                <p className="text-center text-3xl font-bold">{complaints?.filter((c: any) => c.status_id === 1).length}</p>
                                <p className="text-center text-sm">Reclamações Abertas</p>
                            </div>

                            <div>
                                <p className="text-center text-3xl font-bold">{ranking?.solved_complaints || 0}</p>
                                <p className="text-center text-sm">Reclamações Concluídas</p>
                            </div>

                            <div>
                                <p className="text-center text-3xl font-bold">{ranking?.total_complaints || 0}</p>
                                <p className="text-center text-sm">Total de Reclamações</p>
                            </div>

                            <div>
                                <p className="text-center text-3xl font-bold">{ranking?.resolution || 0}</p>
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
                                {/* Borda superior baseada no status */}
                                <div
                                    className={`absolute top-0 left-0 h-2 w-full rounded-t-lg ${statusStyles[complaint!.status_id as keyof typeof statusStyles]?.border}`}
                                ></div>

                                <div className="p-6 pt-8">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">#{complaint.id}</span>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[complaint!.status_id as keyof typeof statusStyles].badge}}`}
                                        >
                                            {complaint?.status?.name?.toUpperCase()}
                                        </span>
                                    </div>

                                    <h2 className="text-foreground text-2xl font-bold">{complaint?.title}</h2>

                                    <p className="text-muted-foreground mt-3">
                                        {complaint.description.length > 150 ? complaint.description.substring(0, 150) + '...' : complaint.description}
                                    </p>

                                    <div className="text-muted-foreground mt-4 flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} />
                                            <span>{complaint?.department?.municipality?.city?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} />
                                            <span>{new Date(complaint?.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {' '}
                                            <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-xs font-medium">
                                                {complaint?.department?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-border/50 mt-6 flex items-center gap-4 border-t pt-4">
                                        <Link href={route('complaints.show', complaint.id)}>
                                            <button className="text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-6 py-2 font-semibold transition-colors">
                                                Ver detalhes
                                            </button>
                                        </Link>
                                        {/* <button className="px-6 py-2 font-semibold text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                                Avaliar
                                            </button> */}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="border-border rounded-lg border-2 border-dashed py-12 text-center">
                            <h3 className="text-foreground text-lg font-medium">Nenhuma reclamação encontrada</h3>
                            <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova reclamação.</p>
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

                        <hr />

                        <div className="mt-8">
                            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-2xl dark:text-white">É responsável por essa cidade?</h2>
                            <button
                                onClick={() => setOpen(true)} // TODO: Implementar solicitação de acesso
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block w-[220px] flex-shrink-0 cursor-pointer rounded-lg px-5 py-3 font-semibold shadow-md transition-colors"
                            >
                                Solicitar acesso
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog visible={open} onHide={() => setOpen(false)} header="Solicitar acesso" position="center" className="w-full max-w-2xl">
                <div className="flex flex-col gap-4">
                    <SolicitationForm />
                </div>
            </Dialog>
        </GuestLayout>
    );
}
