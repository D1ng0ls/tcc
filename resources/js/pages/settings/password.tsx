import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import PasswordInput from '@/components/password-input';
import PasswordRequirements from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { InputText } from 'primereact/inputtext';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atualizar senha',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Atualizar senha" description="Garanta que sua conta utilize uma senha longa e aleatória para manter a segurança." />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Senha atual</Label>

                            <PasswordInput
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e: any) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Senha atual"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova senha</Label>

                            <PasswordInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e: any) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Nova senha"
                            />

                            <PasswordRequirements value={data.password} className="mt-1" />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>

                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e: any) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Confirmar senha"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Salvar senha</Button>

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
