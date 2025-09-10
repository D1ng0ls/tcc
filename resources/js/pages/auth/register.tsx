import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { InputText } from 'primereact/inputtext';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

export default function Register() {
    const { cities, states } = usePage().props;
    const [step, setStep] = useState(1);

    const [state, setClientState] = useState<number | null>(null);

    type RegisterForm = {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        cpf: string;
        birth_date: Date | null;
        city_id: number | null;
        address: string;
    };

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        cpf: '',
        birth_date: null,
        city_id: null,
        address: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onError: () => setStep(1),
        });
    };

    return (
        <AuthLayout title="Cadastre-se" description="">
            <Head title="Cadastrar" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-6" style={{ display: step === 1 ? 'grid' : 'none' }}>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <InputText
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Nome completo"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="document">Documento</Label>
                            <InputMask
                                type="text"
                                name="document"
                                id="document"
                                placeholder="CPF"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                required
                                value={data.cpf}
                                onChange={(e) => setData('cpf', e.target.value as string)}
                                mask={'999.999.999-99'}
                                slotChar="_"
                                maxLength={18}
                                autoClear={false}
                            />
                            <InputError message={errors.cpf} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date">Data de nascimento</Label>
                            <Calendar
                                name="date"
                                id="date"
                                placeholder="Data de nascimento"
                                required
                                value={data.birth_date ? new Date(data.birth_date) : null}
                                onChange={(e) => setData('birth_date', e.value as Date)}
                                dateFormat="dd/mm/yy"
                                inputClassName='rounded-xl!'
                                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                            />
                            <InputError message={errors.birth_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <InputText
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="email@example.com"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" className="mt-2 w-full text-md cursor-pointer" tabIndex={5} disabled={processing || !data.name || !data.cpf || !data.email} onClick={() => setStep(2)}>
                                Próxima <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6" style={{ display: step === 2 ? 'grid' : 'none' }}>
                        <div className='grid gap-2'>
                            <Label htmlFor="state">Estado</Label>
                            <Dropdown
                                id="state"
                                value={state}
                                options={states as any}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => setClientState(e.value)}
                                placeholder="Selecione um estado"
                                filter
                                showClear
                                className="w-full! rounded-xl! bg-background!"
                                panelClassName="bg-background!"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Dropdown
                                id="city"
                                value={data.city_id}
                                options={(cities as any).filter((city: any) => city.state_id === state)}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => setData({ ...data, city_id: e.value })}
                                placeholder="Selecione uma cidade"
                                filter
                                showClear
                                className="w-full! rounded-xl! bg-background!"
                                panelClassName="bg-background!"
                                disabled={!state}
                            />
                            <InputError message={errors.city_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Endereço</Label>
                            <InputText
                                id="address"
                                type="text"
                                required
                                tabIndex={4}
                                autoComplete="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                disabled={processing}
                                placeholder="Endereço"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" className="mt-2 text-md cursor-pointer" tabIndex={5} disabled={processing} onClick={() => setStep(1)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button type="button" className="mt-2 w-full text-md cursor-pointer" tabIndex={5} disabled={processing || !data.city_id || !data.address} onClick={() => setStep(3)}>
                                Próxima <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6" style={{ display: step === 3 ? 'grid' : 'none' }}>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <InputText
                                id="password"
                                type="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Senha"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>
                            <InputText
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirmar Senha"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" className="mt-2 text-md cursor-pointer" tabIndex={5} disabled={processing} onClick={() => setStep(2)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button type="submit" className="mt-2 w-full text-md cursor-pointer" tabIndex={5} disabled={processing || !data.password || !data.password_confirmation}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Criar conta
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Já possui uma conta?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Faça login
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
