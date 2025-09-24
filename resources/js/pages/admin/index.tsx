import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Clock, FileWarning, Flag, Map, MessageCircle, Plus, User } from 'lucide-react';

export default function AdminIndex() {
    const { users, complaints, municipalities, cityRequests } = usePage().props as any;
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Saúde da plataforma 🩺</h1>
                        <p className="text-md text-muted-foreground">Verifique a saúde da plataforma</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="border border-border rounded-xl p-6 flex flex-row justify-between items-center gap-4 bg-primary-foreground">
                        <div>
                            <h2 className="text-md text-muted-foreground">Cidades Ativas</h2>
                            <p className="text-3xl font-bold">{Number(municipalities).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full flex items-center justify-center bg-sky-100 text-blue-500">
                            <Map className="w-full h-full" />
                        </div>
                    </div>
                    <div className="border border-border rounded-xl p-6 flex flex-row justify-between items-center gap-4 bg-primary-foreground">
                        <div>
                            <h2 className="text-md text-muted-foreground">Usuários Cadastrados</h2>
                            <p className="text-3xl font-bold">{Number(users).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full flex items-center justify-center bg-green-100 text-emerald-500">
                            <User className="w-full h-full" />
                        </div>
                    </div>
                    <div className="border border-border rounded-xl p-6 flex flex-row justify-between items-center gap-4 bg-primary-foreground">
                        <div>
                            <h2 className="text-md text-muted-foreground">Total de Reclamações</h2>
                            <p className="text-3xl font-bold">{Number(complaints).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full flex items-center justify-center bg-yellow-100 text-amber-500">
                            <MessageCircle className="w-full h-full" />
                        </div>
                    </div>
                    <div className="border border-border rounded-xl p-6 flex flex-row justify-between items-center gap-4 bg-primary-foreground">
                        <div>
                            <h2 className="text-md text-muted-foreground">Solicitações Pendentes</h2>
                            <p className="text-3xl font-bold">{Number(cityRequests).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-full flex items-center justify-center bg-red-100 text-red-500">
                            <Clock className="w-full h-full" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <div className="flex flex-col flex-wrap justify-between items-start gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                        <div>
                            <h3 className="text-lg font-bold">Ranking de Cidades 🏆</h3>
                        </div>
                        <div className="flex flex-col flex-wrap justify-between items-center gap-4 w-full">
                            <div className="flex flex-row justify-between items-center gap-3 bg-green-100 w-full p-2 rounded-lg">
                                <div className="flex flex-row items-center gap-3">
                                    <div className='w-6 h-6 text-white text-sm font-bold rounded-full bg-green-500 flex items-center justify-center'>
                                        <span className="font-semibold">1</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted">São Paulo</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-600 text-sm">98% eficiência</span>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3 bg-blue-100 w-full p-2 rounded-lg">
                                <div className="flex flex-row items-center gap-3">
                                    <div className='w-6 h-6 text-white text-sm font-bold rounded-full bg-blue-500 flex items-center justify-center'>
                                        <span className="font-semibold">2</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted">Birigui</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-blue-600 text-sm">95% eficiência</span>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3 bg-gray-100 w-full p-2 rounded-lg">
                                <div className="flex flex-row items-center gap-3">
                                    <div className='w-6 h-6 text-white text-sm font-bold rounded-full bg-gray-500 flex items-center justify-center'>
                                        <span className="font-semibold">3</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted">Campinas</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600 text-sm">98% eficiência</span>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3 bg-red-100 w-full p-2 rounded-lg">
                                <div className="flex flex-row items-center gap-3">
                                    <div className='w-6 h-6 text-white text-sm font-bold rounded-full bg-red-500 flex items-center justify-center'>
                                        <span className="font-semibold">!</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted">Rio de Janeiro</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-red-600 text-sm">45% eficiência</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col flex-wrap items-start gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                        <div>
                            <h3 className="text-lg font-bold">Atividade recente 📊</h3>
                        </div>
                        <div className="flex flex-col flex-wrap justify-start items-start gap-4 w-full">
                            <div className="flex flex-row justify-between items-center gap-3">
                                <div className="p-2 rounded-full flex items-start justify-start bg-blue-100 text-blue-500">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Prefeitura de Araçatuba solicitou acesso</p>
                                    <p className="text-xs text-muted-foreground">há 5 minutos</p>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3">
                                <div className="p-2 rounded-full flex items-start justify-start bg-green-100 text-green-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Novo usuário cadastrado em Birigui</p>
                                    <p className="text-xs text-muted-foreground">há 12 minutos</p>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3">
                                <div className="p-2 rounded-full flex items-start justify-start bg-red-100 text-red-500">
                                    <Flag className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Reclamação #456 denunciada por conteúdo ofensivo</p>
                                    <p className="text-xs text-muted-foreground">há 25 minutos</p>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between items-center gap-3">
                                <div className="p-2 rounded-full flex items-start justify-start bg-yellow-100 text-amber-500">
                                    <Check className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Reclamação #445 foi resolvida em São Paulo</p>
                                    <p className="text-xs text-muted-foreground">há 1 hora</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}