import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { FileWarning, Hourglass, Check, Radar, MapPin, Clock, Eye } from 'lucide-react';
import { useState } from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';

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
    const { complaints, status } = usePage().props as any;

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

        if (filters.status && c.status_id !== filters.status) {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Reclamação" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border border-border rounded-xl p-4 bg-zinc-900">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div key={card.title} className='border border-border rounded-xl p-6 flex flex-col items-center gap-4 bg-primary-foreground'>
                                    <div className={`w-12 h-12 p-3 rounded-full flex items-center justify-center ${card.color}`}>
                                        <Icon className="w-full h-full text-white" />
                                    </div>
                                    <p className="text-2xl font-bold">{card.value}</p>
                                    <h2 className="text-lg font-light">{card.title}</h2>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="border border-border rounded-xl bg-zinc-900 p-4 flex gap-4">
                    <div className="w-full sm:w-1/3 flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground mb-1">Status</label>
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

                    <div className="w-full flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground mb-1">Buscar</label>
                        <InputText
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Digite para buscar..."
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="border border-border rounded-xl bg-zinc-900 p-4 flex flex-col gap-4">
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint: any) => (
                            <div key={complaint.id} className="relative w-full bg-card border border-border rounded-lg shadow-sm bg-primary-foreground">
                                {/* Borda superior baseada no status */}
                                <div className={`absolute top-0 left-0 w-full h-2 rounded-t-lg ${statusStyles[complaint?.status_id]?.border}`}></div>

                                <div className="p-6 pt-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">#{complaint.id}</span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[complaint?.status_id]?.badge}`}>
                                            {complaint?.status?.name?.toUpperCase()}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-foreground">{complaint?.title}</h2>

                                    <p className="mt-3 text-muted-foreground">
                                        {complaint.description.length > 150 ? complaint.description.substring(0, 150) + '...' : complaint.description}
                                    </p>

                                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><MapPin size={16} /><span>{complaint?.department?.municipality?.city?.name}</span></div>
                                        <div className="flex items-center gap-1.5"><Clock size={16} /><span>{new Date(complaint?.created_at).toLocaleDateString()}</span></div>
                                        <div className="flex items-center gap-1.5"> <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">{complaint?.department?.name}</span></div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
                                        <Link href={route('complaints.show', complaint.id)}>
                                            <button className="px-6 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
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
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                            <h3 className="text-lg font-medium text-foreground">Nenhuma reclamação encontrada</h3>
                            <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova reclamação.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
