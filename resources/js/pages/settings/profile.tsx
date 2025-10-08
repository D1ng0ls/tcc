import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { InputText } from 'primereact/inputtext';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { InputMask } from 'primereact/inputmask';
import { useInitials } from '@/hooks/use-initials';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atualizar perfil',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const getInitials = useInitials();

    const inputRef = useRef(null);
    const [preview, setPreview] = useState(auth.user.photo_url || null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method: 'patch',
        name: auth.user.name || '',
        email: auth.user.email || '',
        photo: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('photo', file);
        setPreview(URL.createObjectURL(file));
    };

    useEffect(() => {
        if (data.photo) {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('photo', data.photo);
        }
    }, [data.photo]);

    const cpfMask = "999.999.999-99?99";
    const cnpjMask = "99.999.999/9999-99";

    const dynamicMask = auth.user.cpf ? String(auth.user.cpf).replace(/\D/g, '').length <= 11 ? cpfMask : cnpjMask : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informações" description="Atualize suas informações" />

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        <div className="flex flex-col items-start gap-4">
                            {preview ? (
                                <img
                                    src={preview as string}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-accent text-lg">
                                    {getInitials(auth.user.name)}
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={inputRef}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            <InputError className="mt-2" message={errors.photo} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>

                            <InputText
                                id="name"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>

                            <InputText
                                id="email"
                                type="email"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="document">Documento</Label>

                            <InputMask
                                id="document"
                                type="text"
                                className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                value={auth.user.cpf ? String(auth.user.cpf) : ''}
                                mask={dynamicMask}
                                autoComplete="username"
                                placeholder="Documento"
                                disabled
                            />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
