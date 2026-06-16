import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Check, ExternalLink, RotateCcw, ShieldAlert, X } from 'lucide-react';

type DisputeRow = {
    id: number;
    status: 'pending' | 'reopened' | 'approved' | 'ignored';
    reason: string | null;
    created_at: string;
    resolved_at: string | null;
    resolved_by: { id: number; name: string } | null;
    user: { id: number; name: string; email: string } | null;
    municipality: {
        id: number;
        name: string;
        city?: { name: string; state?: { uf: string } | null } | null;
    } | null;
    complaint: {
        id: number;
        title: string;
        status_id: number;
        user?: { id: number; name: string } | null;
        department: {
            municipality: {
                city: { name: string; state?: { uf: string } | null } | null;
            } | null;
        } | null;
    };
};

const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
};

const statusBadge = (s: string) => {
    switch (s) {
        case 'pending':
            return 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
        case 'reopened':
            return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
        case 'approved':
            return 'bg-green-500/20 text-green-700 dark:text-green-300';
        case 'ignored':
            return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

const statusLabel = (s: string) =>
    s === 'pending'
        ? 'Pendente'
        : s === 'reopened'
          ? 'Reaberta'
          : s === 'approved'
            ? 'Aprovada'
            : s === 'ignored'
              ? 'Ignorada'
              : s;

export default function AdminDisputes() {
    const { disputes } = usePage().props as any;
    const data: DisputeRow[] = disputes?.data ?? [];

    const breadcrumbs = [{ title: 'Contestações', href: '/admin/disputes' }];

    const resolve = (id: number, action: 'reopened' | 'approved' | 'ignored') => {
        const labels = {
            reopened: 'reabrir',
            approved: 'aprovar como resolvida',
            ignored: 'ignorar (mantém como não resolvida)',
        };
        if (!confirm(`Tem certeza que quer ${labels[action]}?`)) return;
        router.patch(
            route('admin.disputes.resolve', id),
            { action },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contestações" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Contestações</h1>
                            <p className="text-muted-foreground text-sm">
                                Reclamações marcadas como não resolvidas que o cidadão contestou.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-border bg-primary-foreground overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted dark:bg-background">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Reclamação</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Cidade</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Contestada por</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Motivo</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase">Aberta em</th>
                                    <th
                                        className="px-4 py-3 text-center text-xs font-medium uppercase"
                                        title="Decisão do administrador (ou ações disponíveis se ainda estiver pendente)"
                                    >
                                        Decisão do admin
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-muted dark:divide-muted-foreground divide-y">
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-muted-foreground px-4 py-12 text-center">
                                            Nenhuma contestação registrada.
                                        </td>
                                    </tr>
                                )}
                                {data.map((d) => {
                                    const city = d.complaint.department?.municipality?.city;
                                    const cityLabel = city?.name
                                        ? `${city.name}${city.state?.uf ? '/' + city.state.uf : ''}`
                                        : '—';
                                    const contestedBy =
                                        d.municipality?.name ??
                                        d.user?.name ??
                                        'Desconhecido';
                                    const contestedSub =
                                        d.municipality
                                            ? 'Prefeitura'
                                            : d.user?.email || '';

                                    return (
                                    <tr key={d.id} className="hover:bg-muted/40">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={route('admin.complaints.show', d.complaint.id)}
                                                className="text-blue-500 hover:underline inline-flex items-center gap-1 font-medium"
                                            >
                                                #{d.complaint.id} — {d.complaint.title}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{cityLabel}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-foreground">{contestedBy}</div>
                                            {contestedSub && (
                                                <div className="text-muted-foreground text-xs">{contestedSub}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-xs">
                                            <p className="line-clamp-2 text-xs">{d.reason || <em className="text-muted-foreground/60">Sem motivo informado</em>}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(d.status)}`}>
                                                {statusLabel(d.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                                            {new Date(d.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.status === 'pending' ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        title="Reabrir reclamação (volta pra Aberta, todos veem)"
                                                        onClick={() => resolve(d.id, 'reopened')}
                                                        className="rounded-md bg-blue-500/20 px-2 py-1 text-blue-700 dark:text-blue-300 hover:bg-blue-500/40 cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        Reabrir
                                                    </button>
                                                    <button
                                                        title="Marcar como resolvida (vira SOLVED)"
                                                        onClick={() => resolve(d.id, 'approved')}
                                                        className="rounded-md bg-green-500/20 px-2 py-1 text-green-700 dark:text-green-300 hover:bg-green-500/40 cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        title="Ignorar (mantém NÃO resolvida — decisão final)"
                                                        onClick={() => resolve(d.id, 'ignored')}
                                                        className="rounded-md bg-gray-500/20 px-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-500/40 cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Ignorar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="text-muted-foreground text-xs">
                                                        {d.resolved_by?.name ? `Por ${d.resolved_by.name}` : 'Decidida'}
                                                    </div>
                                                    {d.resolved_at && (
                                                        <div className="text-muted-foreground/70 text-[10px]">
                                                            em {formatDate(d.resolved_at)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
