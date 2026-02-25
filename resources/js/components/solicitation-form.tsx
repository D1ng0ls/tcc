import { Label } from '@/components/ui/label';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

export default function SolicitationForm() {
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
                    className="bg-background! w-full! rounded-xl!"
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
                    className="bg-background! w-full! rounded-xl!"
                    panelClassName="bg-background!"
                    required
                    disabled={!data.state_id}
                />
            </div>

            <div className="border-border w-full border-t pt-6">
                <Button type="submit" label={processing ? 'Enviando...' : 'Enviar solicitação'} className="w-full" disabled={processing} />
            </div>
        </form>
    );
}
