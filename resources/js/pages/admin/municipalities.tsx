
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';


export default function AdminMunicipalities() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/municipalities',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Cidades 🏙️</h1>
                        <p className="text-md text-muted-foreground">Gerencie as cidades cadastradas</p>
                    </div>
                </div>
                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div className='w-full'>
                        <InputText placeholder="Buscar cidade" className="w-full p-2 rounded-lg border border-border" />
                    </div>
                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Cidade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Usuários</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Eficiência</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">São Paulo</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs'>Ativo</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">3.245</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">892</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-green-600'>
                                                98%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                            >
                                                Bloquear
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">Birigui</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs'>Ativo</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">124</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">27</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-blue-600'>
                                                95%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                            >
                                                Bloquear
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">Rio de Janeiro</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs'>Desativado</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">2.156</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">1.234</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-red-600'>
                                                45%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-green-500 cursor-pointer text-white hover:bg-green-600`}
                                            >
                                                Ativar
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">Campinas</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs'>Ativo</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">567</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">123</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className='font-medium text-muted-foreground'>
                                                89%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                            >
                                                Bloquear
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