import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useTimeAgo from '@/hooks/use-time-ago';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, ClipboardList, Clock, MapPin, Search, ThumbsDown, ThumbsUp, User, Wrench, TrafficCone, CircleCheckBig, Construction } from 'lucide-react';

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


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reclamação #${complaint.id}`} />
            <div className="border border-border rounded-xl bg-zinc-900 m-4 p-4">
                <div className="border border-border bg-primary-foreground rounded-xl p-4 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <Link href={route('complaints.index')}>
                            <button className={"w-fit cursor-pointer border border-border bg-primary-foreground rounded-xl p-4 flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-muted hover:border-primary transition-all duration-200"}>
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                        </Link>

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

                    {/* <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4 mt-12">Histórico da Reclamação</h2>

                        <div className="flex">
                            <div className="w-28 text-right flex flex-col justify-center flex-shrink-0 border-r-2 border-muted/50 pr-6 mr-6 pb-8 relative">
                                <p className="text-sm text-muted-foreground">02/09/2025</p>

                                <p className="text-xs text-muted-foreground">14:30</p>

                                <div className="w-3 h-3 bg-primary rounded-full border-3 border-card absolute right-[-7px]"></div>
                            </div>

                            <div className="pb-8">
                                <div className="flex items-center gap-2 font-semibold text-lg text-green-500">
                                    <Check size={18} />
                                    <h3>Problema Resolvido</h3>
                                </div>
                                <p className="mt-1 text-foreground/80 text-sm">O reparo do asfalto foi concluído. Equipe da prefeitura finalizou o trabalho de tapa-buraco e sinalização da via.</p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="w-28 text-right flex flex-col justify-center flex-shrink-0 border-r-2 border-muted/50 pr-6 mr-6 pb-8 relative">
                                <p className="text-sm text-muted-foreground">01/09/2025</p>

                                <p className="text-xs text-muted-foreground">09:15</p>

                                <div className="w-3 h-3 bg-primary rounded-full border-3 border-card absolute right-[-7px]"></div>
                            </div>

                            <div className="pb-8">
                                <div className="flex items-center gap-2 font-semibold text-lg text-blue-500">
                                    <Wrench size={18} />
                                    <h3>Início dos Trabalhos</h3>
                                </div>
                                <p className="mt-1 text-foreground/80 text-sm">Equipe técnica iniciou os trabalhos de reparo. Previsão de conclusão: 48 horas.</p>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="w-28 text-right flex flex-col justify-center flex-shrink-0 border-r-2 border-muted/50 pr-6 mr-6 relative">
                                <p className="text-sm text-muted-foreground">28/08/2025</p>

                                <p className="text-xs text-muted-foreground">16:45</p>

                                <div className="w-3 h-3 bg-primary rounded-full border-3 border-card absolute right-[-7px]"></div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 font-semibold text-lg text-orange-500">
                                    <ClipboardList size={18} />
                                    <h3>Vistoria Realizada</h3>
                                </div>
                                <p className="mt-1 text-foreground/80 text-sm">Técnico da prefeitura realizou vistoria no local e confirmou a necessidade de reparo urgente.</p>
                            </div>
                        </div>
                    </div>*/}
                </div>
            </div>
        </AppLayout>
    );
}
