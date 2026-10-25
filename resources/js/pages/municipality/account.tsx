import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasswordRequirements from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Minha conta',
        href: '/account',
    },
];

// "Minha conta" do usuário de departamento: o nome e a troca da senha inicial que o master definiu.
export default function MunicipalityAccount() {
    const { member, auth } = usePage().props as any;

    const profileForm = useForm({ name: member?.name ?? '' });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.put(route('municipality.account.update'), { preserveScroll: true });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('municipality.account.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Minha conta" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="border-border bg-primary-foreground rounded-xl border p-6">
                    <HeadingSmall
                        title="Meus dados"
                        description={`Você atende as reclamações do departamento ${member?.department?.name ?? ''} — ${auth?.user?.name ?? ''}.`}
                    />

                    <form onSubmit={submitProfile} className="mt-6 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <InputText
                                id="name"
                                className="w-full rounded-xl! border border-border! bg-background! p-2 text-foreground!"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={profileForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <InputText
                                id="email"
                                className="w-full rounded-xl! border border-border! bg-background! p-2 text-foreground!"
                                value={member?.email ?? ''}
                                disabled
                            />
                            <p className="text-muted-foreground text-xs">Para trocar o e-mail ou o departamento, fale com o responsável pela prefeitura no sistema.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={profileForm.processing} className="cursor-pointer">
                                Salvar
                            </Button>
                            <Transition
                                show={profileForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">Feito!</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <div className="border-border bg-primary-foreground rounded-xl border p-6">
                    <HeadingSmall title="Trocar senha" description="Troque a senha inicial que você recebeu por uma só sua." />

                    <form onSubmit={submitPassword} className="mt-6 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Senha atual</Label>
                            <PasswordInput
                                id="current_password"
                                ref={currentPasswordInput}
                                value={passwordForm.data.current_password}
                                onChange={(e: any) => passwordForm.setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Senha atual"
                            />
                            <InputError message={passwordForm.errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova senha</Label>
                            <PasswordInput
                                id="password"
                                ref={passwordInput}
                                value={passwordForm.data.password}
                                onChange={(e: any) => passwordForm.setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Nova senha"
                            />
                            <PasswordRequirements value={passwordForm.data.password} className="mt-1" />
                            <InputError message={passwordForm.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>
                            <PasswordInput
                                id="password_confirmation"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e: any) => passwordForm.setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Confirmar senha"
                            />
                            <InputError message={passwordForm.errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={passwordForm.processing} className="cursor-pointer">
                                Salvar senha
                            </Button>
                            <Transition
                                show={passwordForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">Feito!</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
