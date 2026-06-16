import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FileWarning, Hourglass, Check, Radar, MapPin, Clock, Eye, User, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import ComplaintCard from '@/components/complaint-card';

export default function Complaints() {

    const { complaints, status, auth, viewMode, filters: initialFilters, stats } = usePage().props as any;
    const isAdminView = viewMode === 'admin';
    const isMunicipalityView = viewMode === 'municipality';
    // Agora todos os controllers devolvem um paginator
    const complaintList: any[] = complaints?.data ?? [];

    const pageTitle = isAdminView
        ? 'Reclamações'
        : isMunicipalityView
          ? 'Reclamações da prefeitura'
          : 'Minhas Reclamações';
    const pageHref = isAdminView
        ? '/admin/complaints'
        : isMunicipalityView
          ? '/complaints' // no subdomínio cid.* essa é a rota municipality.complaints.index
          : '/complaints';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: pageTitle,
            href: pageHref,
        },
    ];

    const [filters, setFilters] = useState<{ status: number | null; search: string }>({
        status: initialFilters?.status ? Number(initialFilters.status) : null,
        search: initialFilters?.search ?? '',
    });

    /**
     * Aplica filtros via Inertia: navega pra mesma rota com query string,
     * o que recarrega o paginator filtrado vindo do servidor.
     * Sempre volta pra página 1 ao trocar um filtro.
     */
    const navigateWithFilters = (next: { status: number | null; search: string }) => {
        const params: Record<string, string> = {};
        if (next.status) params.status = String(next.status);
        if (next.search.trim()) params.search = next.search.trim();
        router.get(pageHref, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Debounce na busca (300ms)
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const t = setTimeout(() => navigateWithFilters(filters), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search]);

    // Refetch ao voltar pra aba (evita BFCache mostrando status antigo
    // depois que o usuário muda o status na single complaint)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['complaints', 'stats'], preserveScroll: true });
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('pageshow', onVisible);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('pageshow', onVisible);
        };
    }, []);

    const handleStatusChange = (value: number | null) => {
        const next = { ...filters, status: value };
        setFilters(next);
        navigateWithFilters(next); // status muda imediato (sem debounce)
    };

    const cards = [
        {
            title: 'Total de reclamações',
            value: stats?.total ?? complaints?.total ?? 0,
            icon: FileWarning,
            color: 'bg-blue-500',
        },
        {
            title: 'Em andamento',
            value: stats?.in_progress ?? 0,
            icon: Hourglass,
            color: 'bg-yellow-500',
        },
        {
            title: 'Resolvidos',
            value: stats?.solved ?? 0,
            icon: Check,
            color: 'bg-green-500',
        },
        {
            title: 'Abertos',
            value: stats?.open ?? 0,
            icon: Radar,
            color: 'bg-violet-500',
        },
    ];

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={pageTitle} />

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
                                onChange={(e: DropdownChangeEvent) => handleStatusChange(e.value ?? null)}
                                placeholder="Todos"
                                showClear
                                className="w-full"
                            />
                        </div>

                        <div className="w-full flex flex-col">
                            <label className="text-sm font-medium text-muted-foreground mb-1">Buscar</label>
                            <InputText
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                placeholder="Digite para buscar..."
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="border border-border rounded-xl bg-gray-100 dark:bg-zinc-900 p-4 flex flex-col gap-4">
                        {complaintList.length > 0 ? (
                            complaintList.map((complaint: any) => (
                                <ComplaintCard key={complaint.id} complaint={complaint} auth={auth} />
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                                <h3 className="text-lg font-medium text-foreground">Nenhuma reclamação encontrada</h3>
                                <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova reclamação.</p>
                            </div>
                        )}
                    </div>

                    {complaints?.last_page > 1 && (
                        <div className="border-border flex items-center justify-between gap-2 rounded-xl border bg-gray-100 p-3 text-sm dark:bg-zinc-900">
                            <button
                                onClick={() => complaints.prev_page_url && router.get(complaints.prev_page_url, {}, { preserveScroll: true })}
                                disabled={!complaints.prev_page_url}
                                className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden sm:block">Anterior</span>
                            </button>

                            <div className="text-muted-foreground">
                                Página <span className="text-foreground font-semibold">{complaints.current_page}</span>
                                <span className="mx-1">de</span>
                                <span>{complaints.last_page}</span>
                                <span className="hidden sm:inline">
                                    <span className="mx-2">•</span>
                                    {complaints.total} total
                                </span>
                            </div>

                            <button
                                onClick={() => complaints.next_page_url && router.get(complaints.next_page_url, {}, { preserveScroll: true })}
                                disabled={!complaints.next_page_url}
                                className="text-muted-foreground bg-card border-border bg-primary-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                <span className="hidden sm:block">Próxima</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </AppLayout>


        </>
    );
}
