import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Plus, Search } from 'lucide-react';
import { Button } from 'primereact/button';
import { useState } from 'react';

type Department = {
    name: string;
    complaintCount: number;
};

const mockDepartments: Department[] = [
    { name: 'Secretaria de Obras', complaintCount: 102 },
    { name: 'Iluminação Pública', complaintCount: 78 },
    { name: 'Limpeza Urbana', complaintCount: 55 },
    { name: 'Vigilância Sanitária', complaintCount: 31 },
    { name: 'Transporte Público', complaintCount: 92 },
];

export default function Department() {

    const breadcrumbs: (BreadcrumbItem & { current?: boolean })[] = [
        { title: 'Bairros', href: '/neighborhoods', current: true },
    ];

    const [isFormVisible, setIsFormVisible] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFormVisible(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Departamentos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Departamentos 🏢</h1>
                        <p className="text-md text-muted-foreground">Adicione, edite ou remova os departamentos da cidade</p>
                    </div>
                </div>

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex flex-row gap-2'>
                            <InputText placeholder="Buscar departamentos" className="w-full p-2 rounded-lg border border-border" />
                            <Button type="submit" label={isFormVisible ? "Cancelar" : "Adicionar"} className="w-xs" onClick={() => setIsFormVisible(!isFormVisible)} />
                        </div>

                        {isFormVisible && (
                            <div className="w-full mt-2 border-t border-border pt-4">
                                <form onSubmit={submit} className="space-y-4">
                                    <div className='w-full flex flex-row gap-2'>
                                        <InputText
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Secretaria da Infraestrutura"
                                            className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                                            autoFocus
                                        />
                                        <Button type="submit" label={processing ? "Salvando..." : "Salvar"}  className="w-xs" disabled={processing} />
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Departamento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {mockDepartments.map((department) => (
                                        <tr key={department.name} className="hover:bg-muted/50 transition-colors">
                                            <td colSpan={1} className="px-6 py-4 whitespace-nowrap font-medium">{department.name}</td>

                                            <td colSpan={1} className="px-6 py-4 whitespace-nowrap text-muted-foreground">{department.complaintCount}</td>
                                            
                                            <td colSpan={1} className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                                                <button className="px-3 py-1 rounded text-sm bg-blue-500 cursor-pointer text-white hover:bg-blue-600">
                                                    Editar
                                                </button>
                                                <button className="px-3 py-1 rounded text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600">
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}