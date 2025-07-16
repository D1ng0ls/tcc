import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Plus, FileWarning, Hourglass, Check, Radar } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Label } from '@/components/ui/label';

export default function CreateComplaints() {
    const { cities, states, categories, neighborhoods } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        state_id: '',
        city_id: '',
        neighborhood_id: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Nova Reclamação',
            href: '/complaints/create',
        },
    ];

    const submit = (e: any) => {
        e.preventDefault();
        post(route('complaints.store'), {
            onFinish: () => reset('title', 'description', 'category_id', 'state_id', 'city_id', 'neighborhood_id'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Reclamação" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-start'>
                    <div className='col-span-2 border border-border rounded-xl p-6 bg-primary-foreground'>
                        <div className='border-b border-border pb-2'>
                            <h2 className="text-xl font-bold">📝 Nova Reclamação</h2>
                            <p className="text-md text-muted-foreground">Relate um problema em sua cidade e ajude a torná-la melhor</p>
                        </div>
                        <div className='flex flex-col gap-4 mt-4'>
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="title">Título</Label>
                                    <InputText
                                        id="title"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Título"
                                    />
                                    <span>{errors.title}</span>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label htmlFor="description">Descrição</Label>
                                    <InputTextarea
                                        id="description"
                                        required
                                        autoFocus
                                        tabIndex={2}
                                        autoComplete="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Descrição"
                                        rows={8}
                                        style={{ resize: 'none' }}
                                    />
                                    <span>{errors.description}</span>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='border border-border rounded-xl p-6 bg-primary-foreground'>
                        <div className='border-b border-border pb-2'>
                            <h2 className="text-xl font-bold">💡 Dicas</h2>
                            <p className="text-md text-muted-foreground"> Dicas para uma boa reclamação</p>
                        </div>
                        <div className='flex flex-col gap-4 mt-4'>
                            <ul className='list-disc list-inside flex flex-col gap-1.5'>
                                <li className='flex items-start gap-2'>
                                    <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                    Seja específico no título
                                </li>
                                <li className='flex items-start gap-2'>
                                    <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                    <span>Inclua fotos do problema</span>
                                </li>
                                <li className='flex items-start gap-2'>
                                    <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                    Descreva como afeta a comunidade
                                </li>
                                <li className='flex items-start gap-2'>
                                    <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                    Informe a localização exata
                                </li>
                                <li className='flex items-start gap-2'>
                                    <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                    Mencione se há riscos à segurança
                                </li>
                            </ul>
                        </div>
                        <div className='border-b border-border pb-2 mt-8'>
                            <h2 className="text-xl font-bold">📋 Exemplos</h2>
                            <p className="text-md text-muted-foreground">Exemplos por categoria</p>
                        </div>
                        <div className='flex flex-col gap-1.5 mt-4 border-l-2 border-primary pl-4 ml-2'>
                            <p><span className="font-bold">Vias Públicas:</span> Buracos, pavimento danificado</p>
                            <p><span className="font-bold">Iluminação:</span> Postes queimados, ruas escuras</p>
                            <p><span className="font-bold">Limpeza:</span> Lixo acumulado, entulho</p>
                            <p><span className="font-bold">Transporte:</span> Pontos de ônibus danificados</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
