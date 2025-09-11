import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link, useForm, router } from '@inertiajs/react';
import { Plus, FileWarning, Hourglass, Check, Radar } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Label } from '@/components/ui/label';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateComplaints() {
    const { cities, states, categories, auth } = usePage().props as any;
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        department_id: 0,
        state_id: auth.user?.city?.state_id || undefined,
        city_id: auth.user?.city?.id || undefined,
        neighborhood_id: auth.user?.neighborhood?.id || null,
        district: '',
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
            onFinish: () => reset(),
        });
    };

    useEffect(() => {
        if (data.city_id) {
            axios.get(route('cities.neighborhoods', { city: data.city_id }))
                .then(
                    (response: any) => {
                        setNeighborhoods([
                            ...response.data,
                            {
                                name: "Outro",
                                id: null,
                            },
                        ]);
                    }
                );

            axios.get(route('cities.departments', { city: data.city_id }))
                .then(
                    (response: any) => {
                        setDepartments(response.data);
                    }
                );
        }
    }, [data.city_id]);
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
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="state_id">Estado</Label>
                                        <Dropdown
                                            id="state_id"
                                            value={data.state_id || undefined}
                                            options={states as any}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('state_id', e.value)}
                                            placeholder="Selecione o estado"
                                            filter
                                            showClear
                                            className="w-full! rounded-xl! bg-background!"
                                            panelClassName="bg-background!"
                                            required
                                        />
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="city_id">Cidade</Label>
                                        <Dropdown
                                            id="city_id"
                                            value={data.city_id}
                                            options={(cities as any).filter((city: any) => city.state_id === data.state_id)}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('city_id', e.value)}
                                            placeholder="Selecione a cidade"
                                            filter
                                            showClear
                                            className="w-full! rounded-xl! bg-background!"
                                            panelClassName="bg-background!"
                                            required
                                            disabled={!data.state_id}
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2`}>
                                        <Label htmlFor="neighborhood_id">Bairro</Label>
                                        <Dropdown
                                            id="neighborhood_id"
                                            value={data.neighborhood_id}
                                            options={(neighborhoods as any) || []}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('neighborhood_id', e.value)}
                                            placeholder="Selecione o bairro"
                                            filter
                                            showClear
                                            className="w-full! rounded-xl! bg-background!"
                                            panelClassName="bg-background!"
                                            required
                                            disabled={!data.city_id}
                                        />
                                        {
                                            data.neighborhood_id === null && (
                                                <InputText
                                                    id="district"
                                                    value={data.district}
                                                    onChange={(e) => setData('district', e.target.value)}
                                                    placeholder="Digite o bairro"
                                                    className="w-full rounded-xl bg-background"
                                                    required
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                                <div className={`flex flex-col gap-2 col-span-2 ${data.neighborhood_id === null ? 'col-span-2' : 'col-span-3'}`}>
                                    <Label htmlFor="department_id">Departamento</Label>
                                    <Dropdown
                                        id="department_id"
                                        value={data.department_id}
                                        options={(departments as any) || []}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={(e) => setData('department_id', e.value)}
                                        placeholder="Selecione o departamento"
                                        filter
                                        showClear
                                        className="w-full! rounded-xl! bg-background!"
                                        panelClassName="bg-background!"
                                        required
                                        disabled={!data.city_id}
                                    />
                                </div>
                                <div className='mt-4 flex justify-end'>
                                    <Button type="submit" label="Enviar" className="w-full" disabled={processing} />
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
