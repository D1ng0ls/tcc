import PasswordInput from '@/components/password-input';
import PasswordRequirements, { isPasswordValid } from '@/components/password-requirements';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';

type SortField = 'name' | 'status' | 'complaints' | 'efficiency';
type Direction = 'asc' | 'desc';

const SORT_DEFAULT_DIRECTION: Record<SortField, Direction> = {
    name: 'asc',
    status: 'desc', // ativos primeiro por default
    complaints: 'desc', // mais reclamações primeiro
    efficiency: 'desc', // mais eficientes primeiro
};

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
    const [sort, setSort] = useState<SortField>('name');
    const [direction, setDirection] = useState<Direction>('asc');
    const [municipality, setMunicipality] = useState({}) as any;
    const [visible, setVisible] = useState(false);

    const toggleSort = (field: SortField) => {
        if (sort === field) {
            setDirection(direction === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(field);
            setDirection(SORT_DEFAULT_DIRECTION[field]);
        }
        setPage(1);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sort !== field) return <ChevronsUpDown className="text-muted-foreground/60 ml-1 inline h-3.5 w-3.5" />;
        return direction === 'asc' ? (
            <ChevronUp className="text-primary ml-1 inline h-3.5 w-3.5" />
        ) : (
            <ChevronDown className="text-primary ml-1 inline h-3.5 w-3.5" />
        );
    };

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm<{
        email: string;
        password: string;
    }>({
        email: '',
        password: '',
    });

    useEffect(() => {
        municipalitiesAll();
    }, [search, page, sort, direction]);

    const municipalitiesAll = () => {
        axios
            .get(route('admin.municipalities.all'), {
                params: {
                    search,
                    page,
                    sort,
                    direction,
                },
            })
            .then((response) => {
                setMunicipalities(response.data);
            })
            .catch((error) => {
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
        router.get(route('admin.municipalities.toggle', id), {}, {
            onSuccess: () => municipalitiesAll(),
        });
    };

    const submitUpdate = () => {
        patch(route('admin.municipalities.update', municipality.id), {
            preserveScroll: true,
            onSuccess: () => {
                setVisible(false);
                reset();
                municipalitiesAll();
            },
        });
    };

    /**
     * Validações cliente-side + modal de confirmação antes de salvar.
     * - Email pode ficar igual (não altera nada relativo a ele).
     * - Senha é opcional, mas se preenchida precisa passar nas regras
     *   (8+ chars, maiúscula, minúscula, número, símbolo — mesmas do cadastro).
     * Avisa que a sessão atual da prefeitura será encerrada.
     */
    const handleConfirmUpdate = () => {
        clearErrors();

        const emailChanged = !!data.email && data.email !== municipality.email;
        const passwordProvided = !!data.password;

        if (!emailChanged && !passwordProvided) {
            confirmDialog({
                message: 'Nenhuma alteração informada. Mude o e-mail ou forneça uma nova senha.',
                header: 'Sem alterações',
                acceptLabel: 'OK',
                rejectClassName: 'hidden',
                accept: () => {},
            });
            return;
        }

        if (passwordProvided && !isPasswordValid(data.password)) {
            confirmDialog({
                message: 'A nova senha não atende a todos os requisitos. Verifique os critérios abaixo do campo.',
                header: 'Senha inválida',
                acceptLabel: 'OK',
                rejectClassName: 'hidden',
                accept: () => {},
            });
            return;
        }

        const changesList: string[] = [];
        if (emailChanged) changesList.push('novo e-mail');
        if (passwordProvided) changesList.push('nova senha');

        confirmDialog({
            message: (
                <div>
                    <p>
                        Você está prestes a alterar <strong>{changesList.join(' e ')}</strong> da prefeitura de{' '}
                        <u>{municipality.city?.name}</u>.
                    </p>
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        ⚠ Isso vai encerrar a sessão atual dela. O responsável precisará usar as novas credenciais
                        para acessar o painel da cidade.
                    </p>
                </div>
            ),
            header: 'Confirmar alteração',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: submitUpdate,
            reject: () => {},
        });
    };

    const pagination = <Pagination paginatedPosts={municipalities} handlePreviousPage={handlePreviousPage} handleNextPage={handleNextPage} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ConfirmDialog />
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-border bg-primary-foreground flex flex-row flex-wrap items-center justify-between gap-4 rounded-xl border p-8">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Cidades 🏙️</h1>
                        <p className="text-md text-muted-foreground">Gerencie as cidades cadastradas</p>
                    </div>
                </div>
                <div className="border-border bg-primary-foreground flex flex-col flex-wrap items-center justify-between gap-4 rounded-xl border p-8">
                    <div className="w-full">
                        <InputText
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            placeholder="Buscar cidade"
                            className="border-border w-full rounded-lg border p-2"
                        />
                    </div>
                    <div className="bg-background dark:bg-muted border-border w-full overflow-hidden rounded-lg border">
                        <div className="overflow-x-auto">
                            {pagination}
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('name')}
                                                className="hover:text-primary inline-flex cursor-pointer items-center"
                                            >
                                                Cidade
                                                <SortIcon field="name" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('status')}
                                                className="hover:text-primary inline-flex cursor-pointer items-center"
                                            >
                                                Status
                                                <SortIcon field="status" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Usuários</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('complaints')}
                                                className="hover:text-primary inline-flex cursor-pointer items-center"
                                            >
                                                Reclamações
                                                <SortIcon field="complaints" />
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                            <button
                                                type="button"
                                                onClick={() => toggleSort('efficiency')}
                                                className="hover:text-primary inline-flex cursor-pointer items-center"
                                            >
                                                Eficiência
                                                <SortIcon field="efficiency" />
                                            </button>
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-muted dark:divide-muted-foreground divide-y">
                                    {((municipalities?.data as any) || []).map(
                                        (municipality: {
                                            id: number;
                                            city: any;
                                            active: true;
                                            users_count: number;
                                            complaints_count: number;
                                            efficiency: number | null;
                                            email: string;
                                        }) => (
                                            <tr key={municipality.id} className="hover:bg-muted group cursor-pointer">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                    {municipality.city.name} - {municipality.city.state.uf}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span
                                                        className={`font-medium ${municipality.active ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'} rounded-full px-2 py-1 text-xs`}
                                                    >
                                                        {municipality.active ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>

                                                <td className="text-muted-foreground px-6 py-4 text-center whitespace-nowrap">
                                                    {municipality.users_count ?? 0}
                                                </td>
                                                <td className="text-muted-foreground px-6 py-4 text-center whitespace-nowrap">
                                                    {municipality.complaints_count}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {municipality.efficiency !== null && municipality.efficiency !== undefined ? (
                                                        <span
                                                            className={`font-medium ${
                                                                municipality.efficiency >= 70
                                                                    ? 'text-green-600'
                                                                    : municipality.efficiency >= 40
                                                                      ? 'text-yellow-600'
                                                                      : 'text-red-500'
                                                            }`}
                                                        >
                                                            {municipality.efficiency}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="opacity-0 group-hover:opacity-100">
                                                    <div className="flex flex-row justify-center gap-2">
                                                        <button
                                                            disabled={!municipality.active}
                                                            title={
                                                                !municipality.active
                                                                    ? 'Ative a prefeitura para poder modificar suas credenciais'
                                                                    : 'Modificar e-mail e senha de acesso'
                                                            }
                                                            className="bg-primary-foreground text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary-foreground disabled:hover:text-primary"
                                                            onClick={() => {
                                                                if (!municipality.active) return;
                                                                setMunicipality(municipality);
                                                                clearErrors();
                                                                setData({
                                                                    email: municipality?.email || '',
                                                                    password: '',
                                                                });
                                                                setVisible(true);
                                                            }}
                                                        >
                                                            Modificar
                                                        </button>
                                                        <button
                                                            className={`text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded px-3 py-1 text-sm ${!!municipality.active ? 'bg-red-600' : 'bg-green-600'}`}
                                                            onClick={() => handleToggle(municipality.id)}
                                                        >
                                                            {municipality.active ? 'Desativar' : 'Ativar'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                    {((municipalities?.data as any) || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-muted-foreground px-6 py-12 text-center whitespace-nowrap">
                                                {search ? (
                                                    <>
                                                        Nenhuma cidade encontrada para "
                                                        <span className="text-foreground font-medium">{search}</span>".
                                                    </>
                                                ) : (
                                                    'Nenhuma cidade cadastrada.'
                                                )}
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
                onHide={() => {
                    setVisible(false);
                    clearErrors();
                }}
                header={`Modificar ${municipality?.city?.name ?? 'prefeitura'}`}
                position="center"
                className="w-full max-w-xl"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm">
                        Altere o e-mail, a senha — ou os dois. Mantenha o e-mail atual para trocar apenas a
                        senha; deixe a senha em branco para trocar apenas o e-mail.
                    </p>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="muni-email" className="text-sm font-medium">
                            E-mail de acesso
                        </label>
                        <InputText
                            id="muni-email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="prefeitura@exemplo.gov"
                            className="w-full"
                            type="email"
                        />
                        {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="muni-password" className="text-sm font-medium">
                            Nova senha <span className="text-muted-foreground font-normal">(opcional)</span>
                        </label>
                        <PasswordInput
                            id="muni-password"
                            value={data.password}
                            onChange={(e: any) => setData('password', e.target.value)}
                            placeholder="Deixe em branco para manter a atual"
                            autoComplete="new-password"
                        />
                        {data.password && <PasswordRequirements value={data.password} className="mt-1" />}
                        {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
                    </div>

                    {(errors as any).general && (
                        <div className="rounded-md border border-red-400 bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            {(errors as any).general}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            onClick={() => {
                                setVisible(false);
                                clearErrors();
                            }}
                            className="p-button-text"
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmUpdate} disabled={processing}>
                            {processing ? 'Salvando…' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </AppLayout>
    );
}
