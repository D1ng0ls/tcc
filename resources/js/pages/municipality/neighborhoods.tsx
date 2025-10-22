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

export default function Neighborhood() {
    const { neighborhoods } = usePage().props;
    const [selectedNeighborhood, setSelectedNeighborhood] = useState({}) as any;
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const breadcrumbs: (BreadcrumbItem & { current?: boolean })[] = [
        { title: 'Bairros', href: '/neighborhoods', current: true },
    ];

    const [isFormVisible, setIsFormVisible] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
    });

    const handleSubmit = () => {
        if (processing || loading) return;
        setLoading(true);
        router.post(route('municipality.neighborhoods.store'), data, {
            onSuccess: () => {setIsFormVisible(false); reset();},
        });
    };

    const handleUpdate = () => {
        if (processing || loading) return;
        setLoading(true);
        patch(route('municipality.neighborhoods.update', selectedNeighborhood.id), {
            onSuccess: () => {setVisible(false); reset();},
        });
    };

    const handleDelete = (neighborhood_id: number) => {
        if (processing || loading) return;
        setLoading(true);
        router.delete(route('municipality.neighborhoods.destroy', neighborhood_id), {
            onSuccess: () => setLoading(false),
        });
    };

    const handleDeleteConfirm = (neighborhood: any) => {
        if (processing || loading) return;
        confirmDialog({
            message: `Ao excluir um bairro, todos os reclamações associadas a ele serão transferidas para o bairro "Outros".`,
            header: `Tem certeza que deseja excluir o bairro ${neighborhood.name}?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => handleDelete(neighborhood.id),
            reject: () => {},
        });
    };

    const neighborhoodsFiltered = (neighborhoods as any || []).filter((neighborhood: any) => neighborhood.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ConfirmDialog />
            <Head title="Gerenciar Bairros" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <Headline 
                    title="Gerenciar Bairros 🏙️" 
                    description="Adicione, edite ou remova os bairros da cidade" 
                />

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">

                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex flex-row gap-2'>
                            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar bairros" className="w-full p-2 rounded-lg border border-border" />
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase w-1/2">Bairro</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {(neighborhoodsFiltered as any || []).map((neighborhood: any) => (
                                        <tr key={neighborhood.id || neighborhood.name} className="hover:bg-muted/50 transition-colors w-full group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{neighborhood.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-center">{neighborhood.complaints_count}</td>
                                            {neighborhood.id && (
                                                <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center gap-2 group-hover:opacity-100 opacity-0">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedNeighborhood(neighborhood);
                                                            reset({
                                                                name: neighborhood.name || '',
                                                            });
                                                            setVisible(true);
                                                        }}
                                                        disabled={processing || loading}
                                                        className="px-3 py-1 rounded text-sm bg-primary-foreground text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConfirm(neighborhood)}
                                                        disabled={processing || loading}
                                                        className="px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground bg-red-500">
                                                        Excluir
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {(neighborhoodsFiltered as any || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                                                Nenhum bairro encontrado
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
                onHide={() => { setVisible(false); reset(); setSelectedNeighborhood({}) }}
                header={`Modificar ${selectedNeighborhood?.name}`}
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
                        onClick={() => handleUpdate()}
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