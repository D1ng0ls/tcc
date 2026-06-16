import { Label } from '@/components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';

type InitialCity = { id: number; name: string; uf: string; state_id: number };

/**
 * Formulário de solicitação de acesso de gestor público.
 *
 * - Estado e Cidade são dois selects dependentes: ao escolher o estado,
 *   as cidades são carregadas sob demanda (rota `cities.index`).
 * - `initialCity`: quando informado (via ?city_id= na URL), já vem com o
 *   estado e a cidade pré-selecionados — mas tudo continua editável.
 * - Detecta login: visitantes não autenticados veem um aviso para entrar.
 */
export default function SolicitationForm({ initialCity }: { initialCity?: InitialCity | null }) {
    const { auth, states } = usePage().props as any;
    const user = auth?.user;

    const { data, setData, post, processing, errors } = useForm<{
        requester: string;
        email: string;
        city_id: number | undefined;
    }>({
        requester: user?.name || '',
        email: user?.email || '',
        city_id: initialCity?.id,
    });

    const [stateId, setStateId] = useState<number | undefined>(initialCity?.state_id);
    const [cities, setCities] = useState<Array<{ id: number; name: string }>>(
        initialCity ? [{ id: initialCity.id, name: initialCity.name }] : [],
    );
    const [loadingCities, setLoadingCities] = useState(false);

    const loadCities = async (sid: number) => {
        setLoadingCities(true);
        try {
            const res = await fetch(route('cities.index', sid), { headers: { Accept: 'application/json' } });
            const json = await res.json();
            setCities(Array.isArray(json) ? json : []);
        } catch {
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

    // Carrega a lista completa de cidades do estado pré-selecionado (mantém a cidade escolhida).
    useEffect(() => {
        if (initialCity?.state_id) loadCities(initialCity.state_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onStateChange = (sid: number | undefined) => {
        setStateId(sid);
        setData('city_id', undefined);
        setCities([]);
        if (sid) loadCities(sid);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('solicitation-form.store'), { preserveScroll: true });
    };

    // Visitante não autenticado: orienta o login antes de solicitar.
    if (!user) {
        return (
            <div className="flex flex-col items-start gap-4">
                <p className="text-muted-foreground text-sm">
                    Para solicitar acesso como gestor público, você precisa estar logado em uma conta de cidadão.
                </p>
                <Link
                    href={route('login')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block cursor-pointer rounded-lg px-5 py-2.5 font-semibold shadow-md transition-colors"
                >
                    Entrar para continuar
                </Link>
            </div>
        );
    }

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
                {errors.requester && <p className="mt-1 text-sm text-red-500">{errors.requester}</p>}
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
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
                <Label htmlFor="state_id">Estado</Label>
                <Dropdown
                    id="state_id"
                    value={stateId}
                    options={states || []}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => onStateChange(e.value)}
                    placeholder="Selecione o estado"
                    filter
                    showClear
                    className="bg-background! w-full! rounded-xl!"
                    panelClassName="bg-background!"
                />
            </div>

            <div>
                <Label htmlFor="city_id">Cidade</Label>
                <Dropdown
                    id="city_id"
                    value={data.city_id}
                    options={cities}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => setData('city_id', e.value)}
                    placeholder={loadingCities ? 'Carregando cidades…' : 'Selecione a cidade'}
                    filter
                    showClear
                    disabled={!stateId || loadingCities}
                    className="bg-background! w-full! rounded-xl!"
                    panelClassName="bg-background!"
                />
                {errors.city_id && <p className="mt-1 text-sm text-red-500">{errors.city_id}</p>}
            </div>

            <div className="border-border w-full border-t pt-6">
                <Button type="submit" label={processing ? 'Enviando...' : 'Enviar solicitação'} className="w-full" disabled={processing} />
            </div>
        </form>
    );
}
