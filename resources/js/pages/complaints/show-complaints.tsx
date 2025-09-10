import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
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
    'Aberto': {
        badge: 'bg-green-100 text-green-800',
        border: 'bg-green-500',
    },
    'Em andamento': {
        badge: 'bg-yellow-100 text-yellow-800',
        border: 'bg-yellow-300',
    },
    'Fechado': {
        badge: 'bg-red-200 text-red-700',
        border: 'bg-red-500',
    }
};

export default function CreateComplaints() {

    const { complaints = [] } = usePage().props;

    const mockComplaints: ComplaintProps[] = [
        { 
            id: 1234, 
            title: 'Buraco na Rua das Flores', 
            status: 'Aberto', 
            category: 'Infraestrutura', 
            description: 'Grande buraco no asfalto está causando danos...', 
            location: 'Centro', 
            time: 'Há 2 horas'
        },
        { 
            id: 1235, 
            title: 'Poste de luz queimado', 
            status: 'Em andamento', 
            category: 'Iluminação Pública', 
            description: 'Poste na esquina da Av. Brasil está apagado há 3 dias.', 
            location: 'Vila Nova', 
            time: 'Há 1 dia'
        },
        { 
            id: 1236, 
            title: 'Lixo acumulado na praça', 
            status: 'Fechado', 
            category: 'Limpeza', 
            description: 'Lixo não foi coletado na praça central, causando mau cheiro.', 
            location: 'Centro', 
            time: 'Há 5 horas'
        }
    ];

    const complaintsToRender = mockComplaints;
    
    const [filters, setFilters] = useState<Filters>({
        status: null,
        category: null,
        period: null,
        search: '',
    });

    const status = [
        { 
            label: 'Aberto', 
            value: 'open' 
        },
        { 
            label: 'Em andamento', 
            value: 'in-progress' 
        },
        { 
            label: 'Fechado', 
            value: 'closed' 
        },
    ];

    const category = [
        { 
            label: 'Infraestrutura', 
            value: 'infra' 
        },
        { 
            label: 'Segurança', 
            value: 'security' 
        },
        { 
            label: 'Limpeza', 
            value: 'cleaning' 
        }
    ];

    const handleFilterChange = (field: keyof Filters, value: any) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [field]: value,
        }));
    };

    const summary = [
        { 
            title: 'Em andamentos', 
            value: complaintsToRender.filter(c => c.status === 'Em andamento').length, 
            icon: Hourglass, 
            color: 'bg-yellow-500' 
        },
        { 
            title: 'Fechado', 
            value: complaintsToRender.filter(c => c.status === 'Fechado').length, 
            icon: Radar, 
            color: 'bg-blue-500' 
        },
        { 
            title: 'Abertos', 
            value: complaintsToRender.filter(c => c.status === 'Aberto').length, 
            icon: Check, 
            color: 'bg-green-500' 
        },
        { 
            title: 'Total', 
            value: complaintsToRender.length, 
            icon: FileWarning, 
            color: 'bg-violet-500' 
        }
    ];

    const { cities, states, categories, neighborhoods } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        state_id: '',
        city_id: '',
        neighborhood_id: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Minhas Reclamações',
            href: '/complaints',
        },
    ];

    const cards = [
        {
            title: 'Total de reclamações',
            value: 7,
            icon: FileWarning,
            color: 'bg-blue-500',
        },
        {
            title: 'Em andamento',
            value: 2,
            icon: Hourglass,
            color: 'bg-yellow-500',
        },
        {
            title: 'Abertos',
            value: 10,
            icon: Check,
            color: 'bg-green-500',
        },
        {
            title: 'Acompanhando',
            value: 10,
            icon: Radar,
            color: 'bg-violet-500',
        },
    ];

    const submit = (e: any) => {
        e.preventDefault();
        post(route('complaints.store'), {
            onFinish: () => reset('title', 'description', 'category_id', 'state_id', 'city_id', 'neighborhood_id'),
        });
    };

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
                                    <p className="text-2xl font-bold">10</p>
                                    <h2 className="text-lg font-light">Total de reclamações</h2>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="border border-border rounded-xl bg-zinc-900 p-4 flex gap-4">
                    <div className="w-full sm:w-auto flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground mb-1">Status</label>
                        <Dropdown
                            value={filters.status}
                            options={status}
                            onChange={(e: DropdownChangeEvent) => handleFilterChange('status', e.value)}
                            placeholder="Todos"
                            showClear
                            className="w-full md:w-48" 
                        />
                    </div>

                    <div className="w-full sm:w-auto flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground mb-1">Categoria</label>
                        <Dropdown
                            value={filters.category}
                            options={category}
                            onChange={(e: DropdownChangeEvent) => handleFilterChange('category', e.value)}
                            placeholder="Todas"
                            showClear
                            className="w-full md:w-48"
                        />
                    </div>

                    <div className="w-full sm:w-auto flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground mb-1">Período</label>
                        <Calendar
                            value={filters.period}
                            onChange={(e) => handleFilterChange('period', e.value ?? null)}
                            placeholder="dd/mm/aaaa"
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full md:w-48"
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
                    {complaintsToRender.length > 0 ? (
                        complaintsToRender.map((complaint) => (
                            <div key={complaint.id} className="relative w-full bg-card border border-border rounded-lg shadow-sm bg-primary-foreground">
                                {/* Borda superior baseada no status */}
                                <div className={`absolute top-0 left-0 w-full h-2 rounded-t-lg ${statusStyles[complaint.status].border}`}></div>
                                
                                <div className="p-6 pt-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">#{complaint.id}</span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[complaint.status].badge}`}>
                                            {complaint.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-foreground">{complaint.title}</h2>

                                    <p className="mt-3 text-muted-foreground truncate">
                                        {complaint.description}
                                    </p>

                                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><MapPin size={16} /><span>{complaint.location}</span></div>
                                        <div className="flex items-center gap-1.5"><Clock size={16} /><span>{complaint.time}</span></div>
                                        <div className="flex items-center gap-1.5"> <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">{complaint.category}</span></div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
                                        <button className="px-6 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                                            Ver detalhes
                                        </button>
                                        <button className="px-6 py-2 font-semibold text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                            Avaliar
                                        </button>
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
