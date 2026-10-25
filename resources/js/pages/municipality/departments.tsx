import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { LoaderCircle, Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
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

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        description: '',
        keywords: '',
    });

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (processing || loading) return;
        setLoading(true);
        router.post(route('municipality.departments.store'), data, {
            onSuccess: () => { reset(); },
            onFinish: () => setLoading(false),
        });
    };

    // Formulário próprio do diálogo "Modificar": editar não apaga o rascunho do campo Adicionar.
    const editForm = useForm({ name: '', description: '', keywords: '' });

    const handleUpdate = (e?: FormEvent) => {
        e?.preventDefault();
        if (editForm.processing) return;
        editForm.patch(route('municipality.departments.update', selectedDepartment.id), {
            onSuccess: () => { setVisible(false); editForm.reset(); },
        });
    };

    const handleDelete = (department_id: number) => {
        if (processing || loading) return;
        setLoading(true);
        router.delete(route('municipality.departments.destroy', department_id), {
            onFinish: () => setLoading(false),
        });
    };

    const handleDeleteConfirm = (department: any) => {
        if (processing || loading) return;
        confirmDialog({
            message: `Ao excluir um departamento, todas as reclamações associadas a ele serão transferidas para o departamento "Outros".`,
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
                                            placeholder="Ex: Iluminação Pública"
                                            className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                                            autoFocus
                                        />
                                        <Button type="submit" label={processing || loading ? "Salvando..." : "Salvar"} className="w-xs" disabled={processing || loading} />
                                    </div>
                                    <DepartmentTextsFields
                                        description={data.description}
                                        keywords={data.keywords}
                                        onDescription={(value) => setData('description', value)}
                                        onKeywords={(value) => setData('keywords', value)}
                                    />
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
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Pessoas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {(departmentsFiltered as any || []).map((department: any) => (
                                        <tr key={department.id || department.name} className="hover:bg-muted/50 transition-colors w-full group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <p className="font-medium">{department.name}</p>
                                                {department.description && (
                                                    <p className="text-muted-foreground mt-0.5 text-sm">{department.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-center">{department.complaints_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-center">{department.users_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center gap-2 group-hover:opacity-100 opacity-0">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDepartment(department);
                                                        editForm.setData({
                                                            name: department.name || '',
                                                            description: department.description || '',
                                                            keywords: department.keywords || '',
                                                        });
                                                        setVisible(true);
                                                    }}
                                                    disabled={processing || loading}
                                                    className="px-3 py-1 rounded text-sm bg-primary-foreground text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                                    Editar
                                                </button>
                                                {!department.is_default ? (
                                                    <>
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
                onHide={() => { setVisible(false); editForm.reset(); setSelectedDepartment({}) }}
                header={`Modificar ${selectedDepartment?.name}`}
                position="center"
                className='w-full max-w-xl'
            >
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <InputText
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            placeholder="Nome"
                            disabled={selectedDepartment?.is_default}
                        />
                        {selectedDepartment?.is_default && (
                            <p className="text-muted-foreground -mt-2 text-sm">O nome de um departamento padrão não pode ser alterado.</p>
                        )}
                        <DepartmentTextsFields
                            description={editForm.data.description}
                            keywords={editForm.data.keywords}
                            onDescription={(value) => editForm.setData('description', value)}
                            onKeywords={(value) => editForm.setData('keywords', value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="mt-4 self-end"
                        disabled={editForm.processing}
                    >
                        Salvar
                    </Button>
                </form>
            </Dialog>
        </AppLayout>
    );
}

// Texto do "?" que o cidadão vê ao escolher o departamento e as palavras usadas para sugeri-lo.
function DepartmentTextsFields({
    description,
    keywords,
    onDescription,
    onKeywords,
}: {
    description: string;
    keywords: string;
    onDescription: (value: string) => void;
    onKeywords: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">O que deve ser enviado para este departamento</label>
                <InputTextarea
                    value={description}
                    onChange={(e) => onDescription(e.target.value)}
                    placeholder="Ex: Postes apagados, lâmpadas queimadas e ruas escuras."
                    rows={2}
                    maxLength={500}
                    style={{ resize: 'none' }}
                />
                <p className="text-muted-foreground text-xs">Aparece no "?" ao lado do departamento quando o cidadão abre a reclamação.</p>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Palavras-chave</label>
                <InputTextarea
                    value={keywords}
                    onChange={(e) => onKeywords(e.target.value)}
                    placeholder="Ex: poste, lâmpada, apagad*, escur*"
                    rows={3}
                    maxLength={2000}
                    style={{ resize: 'none' }}
                />
                <p className="text-muted-foreground text-xs">
                    Separe por vírgula. Se o texto da reclamação tiver essas palavras, este departamento é sugerido. Use * no fim para pegar
                    as variações (alag* pega alagamento, alagado, alagou).
                </p>
            </div>
        </div>
    );
}
