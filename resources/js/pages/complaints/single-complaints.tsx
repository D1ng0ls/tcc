import React from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ClipboardList, Clock, MapPin, Search, Wrench } from 'lucide-react';

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

export default function CreateComplaints() {

    const { cities, states, categories, neighborhoods } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        state_id: '',
        city_id: '',
        neighborhood_id: '',
    });

    const complaint = {
        id: 1234,
        title: "Buraco na Rua das Flores",
        status: "Resolvida"
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Single',
            href: '/complaints/single',
        },
    ];

    const complaintImages = [
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
        'https://ogimg.infoglobo.com.br/in/23611951-d94-877/FT1086A/79287512_RI-Rio-de-Janeiro-RJ-09-10-2018-Buraco-na-pista-da-Avenida-Vieira-Souto-esquina-com-Avenida.jpg',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Single" />
            <div className="border border-border rounded-xl bg-zinc-900 m-4 p-4">
                <div className="border border-border bg-primary-foreground rounded-xl p-4 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <button className={"w-fit border border-border bg-primary-foreground rounded-xl p-4 flex items-center justify-center gap-2 font-semibold text-foreground hover:bg-muted hover:border-primary transition-all duration-200"}>
                            <ArrowLeft size={18} />
                            Voltar
                        </button>

                        <span className="px-4 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {complaint.status.toUpperCase()}
                        </span>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground">
                        #{complaint.id}
                    </span>

                    <h2 className="text-2xl font-bold text-foreground mt-4">
                        {complaint.title}
                    </h2>

                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin size={16} /><span>Rua Teste, Centro - Cidade, SP</span></div>
                        <div className="flex items-center gap-1.5"><Clock size={16} /><span>Há 2 horas</span></div>
                    </div>

                    <div className="flex items-center gap-1.5"> <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mt-4">Infraestrutura</span></div>
                </div>

                <div className="border border-border bg-primary-foreground rounded-xl p-4 mt-4 w-full grid">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">Descrição Completa</h2>
                        <p className="text-foreground/80 leading-relaxed">Um grande buraco no asfalto está presente há mais de duas semanas, causando danos aos veículos que passam pelo local e representando um grande risco para pedestres e ciclistas, especialmente durante a noite devido à baixa iluminação da área.</p>
                    </div>  

                    <div className="mt-8 mx-12 overflow-hidden">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Imagens Anexadas</h2>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={4}
                            navigation
                            pagination={{ clickable: true }}
                            className="w-full rounded-lg"
                        >
                            {complaintImages.map((imgUrl, index) => (
                                <SwiperSlide key={index}>
                                    <img src={imgUrl} alt={`Imagem da reclamação ${index + 1}`} className="w-full aspect-square object-cover rounded-md" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div>
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
