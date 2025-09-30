import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { LoaderCircle, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from 'primereact/button';

// Tipagem para os dados de cada bairro
type Neighborhood = {
    name: string;
    complaintCount: number;
    region: string;
    status: 'ATIVO' | 'INATIVO';
};

// Dados de exemplo para preencher a tabela
const mockNeighborhoods: Neighborhood[] = [
    { name: 'Centro', complaintCount: 45, region: 'Centro', status: 'ATIVO' },
    { name: 'Vila São Pedro', complaintCount: 23, region: 'Norte', status: 'ATIVO' },
    { name: 'Jardim Europa', complaintCount: 18, region: 'Sul', status: 'INATIVO' },
    { name: 'Vila Industrial', complaintCount: 31, region: 'Oeste', status: 'ATIVO' },
    { name: 'Parque dos Eucaliptos', complaintCount: 7, region: 'Leste', status: 'ATIVO' },
];

export default function Neighborhood() {

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
            <Head title="Gerenciar Bairros" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Bairros 🏙️</h1>
                        <p className="text-md text-muted-foreground">Adicione, edite ou remova os bairros da cidade</p>
                    </div>
                </div>

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    
                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex flex-row gap-2'>
                            <InputText placeholder="Buscar bairros" className="w-full p-2 rounded-lg border border-border" />
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
                                            placeholder="Ex: Centro"
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Bairro</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {mockNeighborhoods.map((neighborhood) => (
                                        <tr key={neighborhood.name} className="hover:bg-muted/50 transition-colors">
                                            <td colSpan={1} className="px-6 py-4 whitespace-nowrap font-medium">{neighborhood.name}</td>

                                            <td colSpan={1} className="px-6 py-4 whitespace-nowrap text-muted-foreground">{neighborhood.complaintCount}</td>
                                            
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