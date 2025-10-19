import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { LoaderCircle, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Headline from '@/components/ui/headline';

export default function Department() {
    const { departments } = usePage().props;
    const [selectedDepartment, setSelectedDepartment] = useState({}) as any;
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const breadcrumbs: (BreadcrumbItem & { current?: boolean })[] = [
        { title: 'Departamentos', href: '/departments', current: true },
    ];

    const [isFormVisible, setIsFormVisible] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
    });

    const handleSubmit = () => {
        if (processing || loading) return;
        setLoading(true);
        router.post(route('municipality.departments.store'), data, {
            onSuccess: () => { reset(); },
        });
    };

    const handleUpdate = () => {
        if (processing || loading) return;
        setLoading(true);
        patch(route('municipality.departments.update', selectedDepartment.id), {
            onSuccess: () => { setVisible(false); reset(); },
        });
    };

    const handleDelete = (department_id: number) => {
        if (processing || loading) return;
        setLoading(true);
        router.delete(route('municipality.departments.destroy', department_id), {
            onSuccess: () => setLoading(false),
        });
    };

    const handleDeleteConfirm = (department: any) => {
        if (processing || loading) return;
        confirmDialog({
            message: `Ao excluir um departamento, todos os reclamações associadas a ele serão transferidas para o departamento "Outros".`,
            header: `Tem certeza que deseja excluir o departamento ${department.name}?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => handleDelete(department.id),
            reject: () => { },
        });
    };

    const departmentsFiltered = (departments as any || []).filter((department: any) => department.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ConfirmDialog />
            <Head title="Gerenciar Departamentos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <Headline 
                    title="Gerenciar Departamentos 🏢" 
                    description="Adicione, edite ou remova os departamentos da cidade" 
                />

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">

                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex flex-row gap-2'>
                            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar departamentos" className="w-full p-2 rounded-lg border border-border" />
                            <Button type="submit" disabled={processing || loading} label={isFormVisible ? "Cancelar" : (<div className="flex flex-row gap-2 items-center justify-center"><Plus /> Adicionar</div>)} className="w-xs" onClick={() => setIsFormVisible(!isFormVisible)} />
                        </div>

                        {isFormVisible && (
                            <div className="w-full mt-2 border-t border-border pt-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className='w-full flex flex-row gap-2'>
                                        <InputText
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Centro"
                                            className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                                            autoFocus
                                        />
                                        <Button type="submit" label={processing || loading ? "Salvando..." : "Salvar"} className="w-xs" disabled={processing || loading} />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase w-1/2">Departamento</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {(departmentsFiltered as any || []).map((department: any) => (
                                        <tr key={department.id || department.name} className="hover:bg-muted/50 transition-colors w-full group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{department.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-center">{department.complaints_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center gap-2 group-hover:opacity-100 opacity-0">
                                                {!department.is_default ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDepartment(department);
                                                                reset({
                                                                    name: department.name || '',
                                                                });
                                                                setVisible(true);
                                                            }}
                                                            disabled={processing || loading}
                                                            className="px-3 py-1 rounded text-sm bg-primary-foreground text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteConfirm(department)}
                                                            disabled={processing || loading}
                                                            className="px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground bg-red-500">
                                                            Excluir
                                                        </button>
                                                    </>
                                                ) : (
                                                    'Padrão'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(departmentsFiltered as any || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                                                Nenhum departamento encontrado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                visible={visible}
                onHide={() => { setVisible(false); reset(); setSelectedDepartment({}) }}
                header={`Modificar ${selectedDepartment?.name}`}
                position="center"
                className='w-full max-w-xl'
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <InputText
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nome"
                        />
                    </div>
                    <Button
                        onClick={() => handleUpdate(selectedDepartment)}
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