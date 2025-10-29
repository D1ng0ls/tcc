import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { FileWarning, Hourglass, Check, Radar, MapPin, Clock, Eye, User, Star } from 'lucide-react';
import { useState } from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import ComplaintCard from '@/components/complaint-card';

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

export default function Complaints() {

    const { complaints, status, auth } = usePage().props as any;

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
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Minhas reclamações" />

                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="border border-border rounded-xl p-4 bg-gray-100 dark:bg-zinc-900">
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

                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex gap-4">
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

                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex flex-col gap-4">
                        {filteredComplaints.length > 0 ? (
                            filteredComplaints.map((complaint: any) => (
                                <ComplaintCard key={complaint.id} complaint={complaint} auth={auth} />
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


        </>
    );
}
