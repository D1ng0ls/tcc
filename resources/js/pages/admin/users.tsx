import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function AdminUsers() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/users',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Usuários 👥</h1>
                        <p className="text-md text-muted-foreground">Gerencie os usuários</p>
                    </div>
                </div>

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background ">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Usuário</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Cidade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Data de cadastro</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">João Silva</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">Araçatuba</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">prefeito@aracatuba.sp.gov.br</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">26/08/2025</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                            >
                                                Bloquear
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">Maria Santos</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">Marília</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">prefeita@marilia.sp.gov.br</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">26/08/2025</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                            >
                                                Bloquear
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">Pedro Costa</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">Bauru</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">prefeito@bauru.sp.gov.br</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">25/08/2025</td>
                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-green-500 cursor-pointer text-white hover:bg-green-600`}
                                            >
                                                Ativar
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}