import { BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Label } from '@/components/ui/label';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import GuestLayout from '@/layouts/guest-layout';

export default function SolicitationFormPage() {
    const { cities, states, auth } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        requester: '',
        email: '',
        state_id: auth.user?.city?.state_id || undefined,
        city_id: auth.user?.city?.id || undefined,
    });

    const submit = () => {
        post(route('solicitation-form.store'), {
            onSuccess: () => {
                reset();
                console.log('Solicitação enviada com sucesso!');
            },
        });
    };

    return (
        <GuestLayout className='max-w-7xl mx-auto py-8'>
            <Head title="Solicitar Acesso" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl m-auto h-[calc(100vh-11rem)]">
                <div className="bg-card border border-border rounded-xl p-10 bg-primary-foreground">

                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-foreground">Formulário de solicitação</h1>
                        <p className="text-sm text-muted-foreground mt-1">Preencha o formulário para solicitar o gerenciamento da sua cidade.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="requester">Nome do responsável</Label>
                            <InputText
                                id="requester"
                                value={data.requester}
                                onChange={(e) => setData('requester', e.target.value)}
                                placeholder="Nome"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <InputText
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="E-mail"
                                className="w-full"
                            />
                        </div>

                        <div>
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

                        {/* Dropdown: Cidade (depende do Estado) */}
                        <div>
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

                        <div className="w-full pt-6 border-t border-border">
                            <Button type="submit" label={processing ? "Enviando..." : "Enviar solicitação"} className="w-full" disabled={processing} />
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}