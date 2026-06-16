import React, { FormEvent, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useTimeAgo from '@/hooks/use-time-ago';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Building2, Check, ClipboardList, Clock, Flag, History, Lock, MapPin, RotateCcw, Search, Send, Shield, ThumbsDown, ThumbsUp, Trash2, User, Wrench, TrafficCone, CircleCheckBig, Construction } from 'lucide-react';

// Map status_id -> human label (curto, pra timeline)
const STATUS_LABELS: Record<number, string> = {
    1: 'Aberta',
    2: 'Em andamento',
    3: 'Encerrada',
    4: 'Resolvida',
    5: 'Não resolvida',
    6: 'Fechada',
};

const STATUS_DOT_COLOR: Record<number, string> = {
    1: 'bg-sky-500',
    2: 'bg-yellow-400',
    3: 'bg-purple-500',
    4: 'bg-green-500',
    5: 'bg-red-500',
    6: 'bg-stone-500',
};

const ACTOR_LABELS: Record<string, string> = {
    user: 'Cidadão',
    municipality: 'Prefeitura',
    admin: 'Administrador',
    system: 'Sistema',
};

/**
 * Single da complaint é pública: visitantes (sem login) também acessam.
 * AppLayout (com sidebar) para autenticados; GuestLayout para visitantes.
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
                {children}
            </AppLayout>
        );
    }
    return (
        <GuestLayout className="mx-auto max-w-7xl">
            <Head title={title} />
            {children}
        </GuestLayout>
    );
}

type HistoryItem = {
    date: string;
    time: string;
    status: 'Problema Resolvido' | 'Início dos Trabalhos' | 'Vistoria Realizada' | 'Em Análise';
    description: string;
};

type ComplaintDetailsProps = {
    description: string;
    images: string[];
    history: HistoryItem[];
};

const historyIconMap = {
    'Problema Resolvido': { icon: Check, color: 'text-green-500' },
    'Início dos Trabalhos': { icon: Wrench, color: 'text-blue-500' },
    'Vistoria Realizada': { icon: ClipboardList, color: 'text-orange-500' },
    'Em Análise': { icon: Search, color: 'text-gray-500' },
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

export default function ShowComplaint() {
    const { cities, states, categories, neighborhoods, complaint, auth } = usePage().props as any;
    const timeAgo = useTimeAgo(complaint?.created_at);

    const { data, setData, patch, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        state_id: '',
        city_id: '',
        neighborhood_id: '',
    });

    // ---------- Chat ----------
    const isMunicipalityCtx = auth?.guard === 'municipality';
    const isAdmin = auth?.user?.role === 'admin';
    const isOwner = auth?.guard === 'web' && auth?.user?.id === complaint?.user_id;
    const isMunicipalityOfComplaint =
        isMunicipalityCtx && auth?.user?.id === complaint?.department?.municipality_id;
    const canPostMessage = isOwner || isAdmin || isMunicipalityOfComplaint;

    const messageForm = useForm({ body: '' });

    const submitMessage = (e: FormEvent) => {
        e.preventDefault();
        const url = isMunicipalityCtx
            ? route('municipality.complaints.messages.store', complaint.id)
            : route('complaints.messages.store', complaint.id);
        messageForm.post(url, {
            preserveScroll: true,
            onSuccess: () => messageForm.reset(),
        });
    };

    const deleteMessage = (id: number) => {
        if (!isAdmin) return;
        if (!confirm('Remover esta mensagem?')) return;
        router.delete(route('complaint-messages.destroy', id), { preserveScroll: true });
    };

    const messageStyleFor = (m: any) => {
        if (m.is_admin) return 'border-purple-400/60 bg-purple-100/30 dark:bg-purple-500/10';
        if (m.author_type === 'municipality') return 'border-blue-400/60 bg-blue-100/30 dark:bg-blue-500/10';
        return 'border-border bg-muted/40';
    };

    const messageIconFor = (m: any) => {
        if (m.is_admin) return <Shield size={14} className="text-purple-500" />;
        if (m.author_type === 'municipality') return <Building2 size={14} className="text-blue-500" />;
        return <User size={14} className="text-muted-foreground" />;
    };

    // ---------- Status atual (normalizado: Eloquent serializa int mas precaução) ----------
    const statusId = Number(complaint?.status_id);
    const STATUS_SOLVED = 4;
    const STATUS_REJECTED = 5;

    // ---------- Lock do chat ----------
    // Chat fica disponível enquanto o cidadão ainda não deu veredito final.
    // SOLVED = aprovou (trava direto). REJECTED = reprovou — chat continua
    // enquanto houver janela de contestação. Trava se admin já ignorou.
    const disputes = (complaint?.disputes ?? []) as Array<{ status: string }>;
    const hasPendingDispute = disputes.some((d) => d.status === 'pending');
    const hasIgnoredDispute = disputes.some((d) => d.status === 'ignored');
    const hasContestedAlready = disputes.some((d) => d.status === 'pending' || d.status === 'ignored');

    const isFinalizedSolved = statusId === STATUS_SOLVED;
    const isFinalizedRejected = statusId === STATUS_REJECTED && hasIgnoredDispute;
    const chatLocked = isFinalizedSolved || isFinalizedRejected;

    // ---------- Contestação ----------
    // Quem contesta a decisão do cidadão é a PREFEITURA do departamento.
    // O cidadão não vê nem participa do banner de contestação.
    const canContest =
        isMunicipalityOfComplaint &&
        statusId === STATUS_REJECTED &&
        !hasContestedAlready;

    // Status informativo (sem botão) pra admin quando ainda não foi contestado,
    // ou pra prefeitura/admin enquanto a disputa rola.
    const showRejectedInfoAdmin =
        statusId === STATUS_REJECTED && isAdmin;

    const [contestReason, setContestReason] = useState('');
    const [contestOpen, setContestOpen] = useState(false);
    const contestForm = useForm({ reason: '' });
    const submitContest = (e: FormEvent) => {
        e.preventDefault();
        contestForm.setData('reason', contestReason);
        contestForm.post(route('municipality.complaints.disputes.store', complaint.id), {
            preserveScroll: true,
            onSuccess: () => {
                setContestReason('');
                setContestOpen(false);
            },
        });
    };

    // ---------- Timeline ----------
    const events = (complaint?.events ?? []) as Array<{
        id: number;
        type: string;
        from_status: number | null;
        to_status: number | null;
        actor_type: string;
        actor_name: string | null;
        note: string | null;
        created_at: string;
    }>;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Reclamação #${complaint.id}`,
            href: `complaints/${complaint.id}`,
        },
    ];

    const approveComplaint = () => {
        patch(route('complaints.approve', complaint.id));
    };

    const rejectComplaint = () => {
        patch(route('complaints.reject', complaint.id));
    };

    const startComplaint = () => {
        let url = auth?.user?.active ? route('municipality.complaints.start', complaint.id) : route('complaints.start', complaint.id);
        console.log(url);
        patch(url);
    };

    const endComplaint = () => {
        let url = auth?.user?.active ? route('municipality.complaints.end', complaint.id) : route('complaints.end', complaint.id)
        console.log(url);
        patch(url);
    };


    const isAuthenticated = !!auth?.user;

    return (
        <PageShell
            isAuthenticated={isAuthenticated}
            breadcrumbs={breadcrumbs}
            title={`Reclamação #${complaint.id}`}
        >
            {/* ===== BANNER DE CONTESTAÇÃO (TOPO) — APENAS PARA A PREFEITURA ===== */}
            {canContest && (
                <div className="border-2 border-red-400/60 bg-red-50 dark:bg-red-950/30 rounded-xl m-4 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-700 dark:text-red-300">
                                O cidadão marcou esta reclamação como NÃO resolvida.
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Se a sua prefeitura discorda dessa avaliação, você pode contestar e pedir
                                análise de um administrador para reabrir o caso.
                            </p>
                            {!contestOpen ? (
                                <button
                                    onClick={() => setContestOpen(true)}
                                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 cursor-pointer"
                                >
                                    <Flag size={14} />
                                    Contestar
                                </button>
                            ) : (
                                <form onSubmit={submitContest} className="mt-3 flex flex-col gap-2">
                                    <textarea
                                        value={contestReason}
                                        onChange={(e) => setContestReason(e.target.value)}
                                        placeholder="Explique por que sua prefeitura está contestando…"
                                        rows={3}
                                        maxLength={2000}
                                        className="border-border bg-background text-foreground w-full resize-y rounded-md border p-2 text-sm"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setContestOpen(false);
                                                setContestReason('');
                                            }}
                                            className="text-muted-foreground hover:text-foreground cursor-pointer text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={contestForm.processing}
                                            className="inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                                        >
                                            <Flag size={14} />
                                            {contestForm.processing ? 'Enviando…' : 'Enviar contestação'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Aviso pendente — visível para prefeitura e admin (informativo) */}
            {hasPendingDispute && (isMunicipalityOfComplaint || isAdmin) && (
                <div className="border-2 border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 rounded-xl m-4 p-4">
                    <div className="flex items-start gap-3">
                        <Flag className="text-amber-600 mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-amber-700 dark:text-amber-300">
                                Contestação em análise pelo administrador
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Aguarde a decisão da equipe administrativa.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin vê o status quando está REJECTED sem disputa em curso */}
            {showRejectedInfoAdmin && !hasPendingDispute && (
                <div className="border-2 border-red-400/60 bg-red-50 dark:bg-red-950/30 rounded-xl m-4 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-700 dark:text-red-300">
                                Esta reclamação foi marcada como NÃO RESOLVIDA pelo cidadão.
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {hasIgnoredDispute
                                    ? 'A contestação da prefeitura foi analisada e a decisão do cidadão foi mantida.'
                                    : 'Aguardando reação da prefeitura: ela pode contestar pra revisão.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border border-border rounded-xl bg-zinc-900 m-4 p-4">
                <div className="border border-border bg-primary-foreground rounded-xl p-4 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <button
                            onClick={() => window.history.back()}
                            className={"w-fit cursor-pointer border border-border bg-primary-foreground rounded-xl p-4 flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-muted hover:border-primary transition-all duration-200"}
                        >
                            <ArrowLeft size={18} />
                            Voltar
                        </button>

                        <span className={`px-4 py-1 text-xs font-semibold rounded-full ${statusStyles[complaint?.status_id]?.badge}`}>
                            {complaint?.status?.name.toUpperCase()}
                        </span>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground">
                        #{complaint?.id}
                    </span>

                    <h2 className="text-2xl font-bold text-foreground mt-4">
                        {complaint?.title}
                    </h2>

                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin size={16} /><span>{complaint?.address} - {complaint?.neighborhood?.name || complaint?.district}, {complaint?.department?.municipality?.city?.name} - {complaint?.department?.municipality?.city?.state?.uf}</span></div>
                        <div className="flex items-center gap-1.5"><Clock size={16} /><span>{timeAgo}</span></div>
                        {(auth.user?.role === 'admin' || auth.user?.active) && (
                            <div className="flex items-center gap-1.5"><User size={16} /><span>{complaint?.user?.name}</span></div>
                        )}
                    </div>

                    <div className="flex justify-between items-center my-4">
                        <div className="flex items-center gap-1.5"> <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">{complaint?.department?.name}</span></div>
                        <div className="flex flex-row gap-2">
                            {(complaint?.status_id === 3 && auth.user?.role === 'user' || auth.user?.role === 'admin') && (
                                <>
                                    <button onClick={() => approveComplaint()} className={"w-fit cursor-pointer border border-green-500 bg-primary-foreground rounded-xl py-2 px-4 group flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-green-500/60 transition-all duration-200"}>
                                        Aprovar
                                        <ThumbsUp size={18} className="text-green-500 group-hover:text-foreground" />
                                    </button>
                                    <button onClick={() => rejectComplaint()} className={"w-fit cursor-pointer border border-red-500 bg-primary-foreground rounded-xl py-2 px-4 group flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-red-500/60 transition-all duration-200"}>
                                        Rejeitar
                                        <ThumbsDown size={18} className="text-red-500 group-hover:text-foreground" />
                                    </button>
                                </>
                            )}
                            {(auth.user?.active || auth.user?.role === 'admin') && (
                                <>
                                    {(complaint?.status_id === 1 || auth.user?.role === 'admin') && (
                                        <button onClick={() => startComplaint()} className={"w-fit cursor-pointer border border-orange-500 bg-primary-foreground rounded-xl py-2 px-4 group flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-orange-500/60 transition-all duration-200"}>
                                            Iniciar Trabalhos
                                            <TrafficCone size={18} className="text-orange-500 group-hover:text-foreground" />
                                        </button>
                                    )}
                                    {(complaint?.status_id === 2 || auth.user?.role === 'admin') && (
                                        <button onClick={() => endComplaint()} className={"w-fit cursor-pointer border border-indigo-500 bg-primary-foreground rounded-xl py-2 px-4 group flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-indigo-500/60 transition-all duration-200"}>
                                            Encerrar Trabalhos
                                            <Construction size={18} className="text-indigo-500 group-hover:text-foreground" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border border-border bg-primary-foreground rounded-xl p-4 mt-4 w-full grid">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">Descrição Completa</h2>
                        <p className="text-foreground/80 leading-relaxed">{complaint?.description}</p>
                    </div>

                    <div className="mt-8 overflow-hidden">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Imagens Anexadas</h2>
                        {complaint?.archives.length > 0 ? (
                            <Swiper
                                modules={[Navigation, Pagination]}
                                spaceBetween={20}
                                slidesPerView={4}
                                navigation
                                pagination={{ clickable: true }}
                                className="w-full rounded-lg"
                            >
                                {(complaint?.archives || []).map((img: any, index: any) => (
                                    <SwiperSlide key={img?.id}>
                                        {img?.type === 'image' ? (
                                            <img src={'/storage/' + img?.photo_url} alt={`Imagem da reclamação #${complaint?.id} - ${complaint?.title}`} className="w-full aspect-square object-cover rounded-md" />
                                        ) : (
                                            <video src={'/storage/' + img?.photo_url} controls className="w-full aspect-square object-cover rounded-md" />
                                        )}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <p className="text-foreground/80">Nenhuma imagem ou video anexada.</p>
                        )}
                    </div>

                    {/* ===== BANNER POSITIVO QUANDO RESOLVIDA ===== */}
                    {statusId === STATUS_SOLVED && (
                        <div className="mt-8 rounded-xl border-2 border-green-400/50 bg-green-50 p-4 dark:bg-green-950/20">
                            <div className="flex items-start gap-3">
                                <CircleCheckBig className="text-green-600 mt-0.5 h-5 w-5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-green-700 dark:text-green-300">
                                        Reclamação resolvida.
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        O cidadão confirmou que o problema foi resolvido. A conversa foi encerrada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== LINHA DO TEMPO ===== */}
                    {events.length > 0 && (
                        <div>
                            <h2 className="text-foreground mb-4 mt-12 text-xl font-semibold">Histórico da Reclamação</h2>

                            {events.map((ev, idx) => {
                                const date = new Date(ev.created_at);
                                const isLast = idx === events.length - 1;

                                let title = '';
                                let description = '';
                                let dotColor = 'bg-primary';
                                let textColor = 'text-primary';
                                let Icon: any = Clock;

                                if (ev.type === 'created') {
                                    title = 'Reclamação aberta';
                                    description = 'Cidadão registrou a reclamação na plataforma.';
                                    dotColor = 'bg-sky-500';
                                    textColor = 'text-sky-500';
                                    Icon = Flag;
                                } else if (ev.type === 'status_change') {
                                    const toLabel = ev.to_status ? STATUS_LABELS[ev.to_status] : '—';
                                    switch (ev.to_status) {
                                        case 1: // OPEN (reabertura)
                                            title = 'Reclamação reaberta';
                                            description = 'O status voltou para "Aberta".';
                                            dotColor = 'bg-sky-500';
                                            textColor = 'text-sky-500';
                                            Icon = RotateCcw;
                                            break;
                                        case 2: // IN_PROGRESS
                                            title = 'Início dos trabalhos';
                                            description = 'A prefeitura iniciou o atendimento desta reclamação.';
                                            dotColor = 'bg-yellow-400';
                                            textColor = 'text-yellow-500';
                                            Icon = Wrench;
                                            break;
                                        case 3: // ENDED
                                            title = 'Trabalhos encerrados';
                                            description = 'A prefeitura concluiu o atendimento. Aguardando avaliação do cidadão.';
                                            dotColor = 'bg-purple-500';
                                            textColor = 'text-purple-500';
                                            Icon = ClipboardList;
                                            break;
                                        case 4: // SOLVED
                                            title = 'Problema resolvido';
                                            description = 'O cidadão confirmou a resolução do problema.';
                                            dotColor = 'bg-green-500';
                                            textColor = 'text-green-500';
                                            Icon = Check;
                                            break;
                                        case 5: // REJECTED
                                            title = 'Marcada como não resolvida';
                                            description = 'O cidadão contestou a resolução apresentada.';
                                            dotColor = 'bg-red-500';
                                            textColor = 'text-red-500';
                                            Icon = ThumbsDown;
                                            break;
                                        default:
                                            title = `Status alterado para "${toLabel}"`;
                                    }
                                } else if (ev.type === 'dispute_opened') {
                                    title = 'Contestação aberta';
                                    description = 'O cidadão pediu revisão da decisão. Aguardando análise do administrador.';
                                    dotColor = 'bg-amber-500';
                                    textColor = 'text-amber-500';
                                    Icon = Flag;
                                } else if (ev.type === 'dispute_resolved') {
                                    title = 'Contestação resolvida pelo administrador';
                                    description = 'A contestação foi analisada e decidida pelo admin.';
                                    dotColor = 'bg-purple-500';
                                    textColor = 'text-purple-500';
                                    Icon = Shield;
                                }

                                return (
                                    <div key={ev.id} className="flex">
                                        <div
                                            className={`text-muted-foreground border-muted/50 relative mr-6 flex w-28 flex-shrink-0 flex-col justify-center border-r-2 pr-6 text-right ${
                                                isLast ? '' : 'pb-8'
                                            }`}
                                        >
                                            <p className="text-sm">{date.toLocaleDateString('pt-BR')}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div
                                                className={`border-card absolute right-[-7px] h-3 w-3 rounded-full border-[3px] ${dotColor}`}
                                            />
                                        </div>

                                        <div className={isLast ? '' : 'pb-8'}>
                                            <div className={`flex items-center gap-2 text-lg font-semibold ${textColor}`}>
                                                <Icon size={18} />
                                                <h3>{title}</h3>
                                            </div>
                                            {description && (
                                                <p className="text-foreground/80 mt-1 text-sm">{description}</p>
                                            )}
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Por: <span className="font-medium">{ACTOR_LABELS[ev.actor_type] ?? ev.actor_type}</span>
                                                {ev.actor_name && <> — {ev.actor_name}</>}
                                            </p>
                                            {ev.note && (
                                                <p className="text-muted-foreground mt-1 text-xs italic">"{ev.note}"</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ===== CONVERSA PÚBLICA ===== */}
                    <div className="mt-10 border-t border-border pt-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-foreground">Conversa</h2>
                            <p className="text-sm text-muted-foreground">
                                Comentários são públicos. Apenas o administrador pode remover mensagens.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {(complaint?.messages ?? []).length === 0 ? (
                                <div className="border-2 border-dashed border-border rounded-lg py-8 text-center text-sm text-muted-foreground">
                                    Nenhuma mensagem ainda.{' '}
                                    {canPostMessage && 'Seja o primeiro a escrever abaixo.'}
                                </div>
                            ) : (
                                (complaint.messages as any[]).map((m) => (
                                    <div
                                        key={m.id}
                                        className={`rounded-lg border-l-4 p-3 ${messageStyleFor(m)}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {messageIconFor(m)}
                                                <span className="text-foreground text-sm font-semibold">
                                                    {m.author_name}
                                                </span>
                                                {m.is_admin && (
                                                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                                                        ADMIN
                                                    </span>
                                                )}
                                                {m.author_type === 'municipality' && !m.is_admin && (
                                                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                                                        PREFEITURA
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">
                                                    {new Date(m.created_at).toLocaleString('pt-BR')}
                                                </span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => deleteMessage(m.id)}
                                                        title="Remover mensagem"
                                                        className="text-muted-foreground hover:text-red-600 cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-foreground/90 mt-2 whitespace-pre-wrap text-sm">
                                            {m.body}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {chatLocked ? (
                            <div className="text-muted-foreground mt-6 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-center text-xs">
                                <Lock size={14} />
                                A conversa foi encerrada após o veredito final. Apenas o histórico permanece visível.
                            </div>
                        ) : canPostMessage ? (
                            <form onSubmit={submitMessage} className="mt-6 flex flex-col gap-2">
                                <label htmlFor="msg-body" className="text-sm font-medium">
                                    {isMunicipalityOfComplaint || isAdmin
                                        ? 'Responder ao cidadão'
                                        : 'Sua mensagem'}
                                </label>
                                <textarea
                                    id="msg-body"
                                    value={messageForm.data.body}
                                    onChange={(e) => messageForm.setData('body', e.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Escreva uma mensagem…"
                                    className="border-border bg-background text-foreground focus:ring-primary/50 w-full resize-y rounded-xl border p-3 text-sm focus:outline-none focus:ring-2"
                                />
                                {messageForm.errors.body && (
                                    <span className="text-sm text-red-500">{messageForm.errors.body}</span>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                        {messageForm.data.body.length}/2000
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={messageForm.processing || !messageForm.data.body.trim()}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send size={14} />
                                        {messageForm.processing ? 'Enviando…' : 'Enviar'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-muted-foreground mt-6 rounded-lg border border-dashed border-border p-3 text-center text-xs">
                                Somente o cidadão autor desta reclamação, a prefeitura responsável e o administrador podem escrever aqui.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </PageShell>
    );
}
