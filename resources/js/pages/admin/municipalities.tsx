
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@/components/ui/pagination';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

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
    const [municipality, setMunicipality] = useState({}) as any;
    const [visible, setVisible] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        email: '' as string,
        password: '' as string,
        password_confirmation: '' as string,
    } as any);

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

    const handleUpdate = () => {
        post(route('admin.municipalities.update', municipality.id), {
            onSuccess: () => setVisible(false),
        });
    };

    const handleConfirmUpdate = (municipality: any) => {
        if (municipality.active) {
            confirmDialog({
                message: (
                    <div>
                        <p>A prefeitura de <u>{municipality.city.name}</u> consta como <strong className="text-green-600">ATIVA</strong></p>
                        <p>Continuar com esta ação poderá causar transtornos.</p>
                    </div>
                ),
                header: 'Atenção!',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                accept: () => handleToggle(municipality.id),
                reject: () => {},
            });
        }
    }
        

    const pagination = (
        <Pagination
            paginatedPosts={municipalities}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
        />
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ConfirmDialog />
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
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Usuários</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Eficiência</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {(municipalities?.data as any || []).map((municipality: any) => (
                                        <tr key={municipality.id} className="hover:bg-muted group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{municipality.city.name} - {municipality.city.state.uf}</td>
                                            <td className="px-6 py-4 text-center  whitespace-nowrap">
                                                <span className={`font-medium ${municipality.active ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'} px-2 py-1 rounded-full text-xs`}>{municipality.active ? 'Ativo' : 'Inativo'}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center whitespace-nowrap text-muted-foreground">{municipality.users_count}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap text-muted-foreground">{municipality.complaints_count}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className='font-medium text-green-600'>
                                                    98%
                                                </span>
                                            </td>
                                            <td className="opacity-0 group-hover:opacity-100">
                                                <div className='flex flex-row gap-2 justify-center'>
                                                    <button
                                                        className="px-3 py-1 rounded text-sm bg-primary-foreground text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                                        onClick={() => {
                                                            setMunicipality(municipality);
                                                            reset({
                                                                email: municipality.email || '',
                                                                password: '',
                                                                password_confirmation: '',
                                                            });
                                                            setVisible(true);
                                                            setVisible(true)
                                                        }}
                                                    >
                                                        Modificar
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground ${!!municipality.active ? 'bg-red-600' : 'bg-green-600'}`}
                                                        onClick={() => handleToggle(municipality.id)}
                                                    >
                                                        {municipality.active ? 'Desativar' : 'Ativar'}
                                                    </button>
                                                </div>
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
            <Dialog
                visible={visible}
                onHide={() => setVisible(false)}
                header={`Modificar ${municipality?.city?.name}`}
                position="center"
                className='w-full max-w-xl'
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <InputText
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email"
                        />
                        <InputText
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Senha"
                        />
                    </div>
                    <Button
                        onClick={() => handleConfirmUpdate(municipality)}
                        className="mt-4 self-end"
                        disabled={processing}
                    >
                        Salvar
                    </Button>
                </div>
            </Dialog>
        </AppLayout>
    );
}