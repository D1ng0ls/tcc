import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';

export default function AdminSolicitations() {
    const { cityRequests } = usePage().props as any;

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/solicitations',
        },
    ];

    const handleApprove = (cityRequest: any) => {
        router.patch(route('admin.solicitations.approve', cityRequest.id));
    }

    const handleReject = (cityRequest: any) => {
        router.patch(route('admin.solicitations.reject', cityRequest.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Solicitações 📝</h1>
                        <p className="text-md text-muted-foreground">Gerencie as solicitações pendentes</p>
                    </div>
                </div>

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background ">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Cidade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Solicitante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Data</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {(cityRequests || []).map((request: any) => (
                                        <tr className="hover:bg-muted group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{request.city.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{request.requester}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{request.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`font-medium ${request.status === 'approved' ? 'text-green-700 bg-green-100' : request.status === 'rejected' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-yellow-100' } px-2 py-1 rounded-full text-xs`}>{request.status}</span>
                                            </td>
                                            {request.status === 'pending' && (
                                                <td className="px-6 py-4 whitespace-nowrap flex items-center justify-center gap-2 group-hover:opacity-100 opacity-0">
                                                    <button
                                                        onClick={() => handleApprove(request)}
                                                        className={`px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground bg-green-600`}
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request)}
                                                        className={`px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground bg-red-600`}
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {(cityRequests as any || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                                                Nenhuma solicitação encontrada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}