
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@/components/ui/pagination';

export default function AdminMunicipalities() {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/municipalities',
        },
    ];

    const [municipalities, setMunicipalities] = useState([]) as any;
    const [search, setSearch] = useState('') as any;
    const [page, setPage] = useState(1) as any;

    useEffect(() => {
        municipalitiesAll();
    }, [search, page]);

    const municipalitiesAll = () => {
        axios.get(route('admin.municipalities.all'), {
            params: {
                search,
                page,
            },
        })
            .then(response => {
                setMunicipalities(response.data);
            })
            .catch(error => {
                console.error('Erro ao buscar cidades:', error);
            });
    };

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < municipalities.last_page) setPage(page + 1);
    };

    const handleToggle = (id: number) => {
        router.get(route('admin.municipalities.toggle', id));
    };

    const pagination = (
        <Pagination
            paginatedPosts={municipalities}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
        />
    );

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
                        <InputText onChange={(e) => setSearch(e.target.value)} value={search} placeholder="Buscar cidade" className="w-full p-2 rounded-lg border border-border" />
                    </div>
                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            {pagination}
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
                                    {(municipalities?.data as any || []).map((municipality: any) => (
                                        <tr key={municipality.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{municipality.city.name} - {municipality.city.state.uf}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-medium ${municipality.active ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'} px-2 py-1 rounded-full text-xs`}>{municipality.active ? 'Ativo' : 'Inativo'}</span>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{municipality.users_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{municipality.complaints_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className='font-medium text-green-600'>
                                                    98%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {municipality.active ? (
                                                    <button
                                                        onClick={() => handleToggle(municipality.id)}
                                                        className={`px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600`}
                                                    >
                                                        Bloquear
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggle(municipality.id)}
                                                        className={`px-3 py-1 rounded text-sm bg-green-500 cursor-pointer text-white hover:bg-green-600`}
                                                    >
                                                        Ativar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(municipalities?.data as any || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                                                Nenhuma cidade encontrada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {pagination}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}