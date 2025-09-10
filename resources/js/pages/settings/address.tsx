import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { InputText } from 'primereact/inputtext';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Dropdown } from 'primereact/dropdown';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Endereço',
        href: '/settings/address',
    },
];

export default function Address() {
    const { auth, cities, states } = usePage().props as any;
    const [state, setState] = useState<number | null>(auth.user.city?.state.id || null);

    console.log(auth.user);

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        address: auth.user.address ? String(auth.user.address) : '',
        city: auth.user.city ? Number(auth.user.city.id) : null,
    });
    
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('address.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informações" description="Atualize seu nome e e-mail" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className='grid gap-2'>
                            <Label htmlFor="state">Estado</Label>
                            <Dropdown
                                id="state"
                                value={state}
                                options={states as any}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => setState(e.value)}
                                placeholder="Selecione um estado"
                                filter
                                showClear
                                className="w-full! rounded-xl bg-background!"
                                panelClassName="bg-background!"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Dropdown
                                id="city"
                                value={data.city}
                                options={(cities as any).filter((city: any) => city.state_id === state)}
                                optionLabel="name"
                                optionValue="id"
                                onChange={(e) => setData({ ...data, city: e.value })}
                                placeholder="Selecione uma cidade"
                                filter
                                showClear
                                className="w-full! rounded-xl bg-background!"
                                panelClassName="bg-background!"
                                disabled={!state}
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Endereço</Label>

                            <InputText
                                id="address"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                
                                autoComplete="address"
                                placeholder="Endereço"
                            />

                            <InputError className="mt-2" message={errors.address} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className='cursor-pointer'>Salvar</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Feito!</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
