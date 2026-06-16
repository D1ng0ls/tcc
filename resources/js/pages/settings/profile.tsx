import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
import { Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atualizar perfil',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const getInitials = useInitials();

    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(auth.user.photo_url || null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setPhotoError(null);
        setUploadingPhoto(true);

        const formData = new FormData();
        formData.append('photo', file);

        router.post(route('profile.photo.upload'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onError: (errs) => {
                setPhotoError((errs as any).photo ?? 'Erro ao enviar imagem.');
                setPreview(auth.user.photo_url || null);
            },
            onFinish: () => {
                setUploadingPhoto(false);
                if (inputRef.current) inputRef.current.value = '';
            },
        });
    };

    const handleRemovePhoto = () => {
        if (!preview) return;
        setUploadingPhoto(true);
        router.delete(route('profile.photo.remove'), {
            preserveScroll: true,
            onSuccess: () => setPreview(null),
            onFinish: () => setUploadingPhoto(false),
        });
    };

    const cpfMask = "999.999.999-99?99";
    const cnpjMask = "99.999.999/9999-99";

    const dynamicMask = auth.user.cpf ? String(auth.user.cpf).replace(/\D/g, '').length <= 11 ? cpfMask : cnpjMask : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informações" description="Atualize suas informações" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex flex-col items-start gap-4">
                            <div className="flex items-center gap-4">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className={`h-20 w-20 rounded-full border object-cover transition-opacity ${uploadingPhoto ? 'opacity-50' : ''}`}
                                    />
                                ) : (
                                    <div className="bg-accent flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-lg">
                                        {getInitials(auth.user.name)}
                                    </div>
                                )}

                                {preview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        disabled={uploadingPhoto}
                                        className="text-muted-foreground hover:text-red-600 inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                        Remover foto
                                    </button>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={inputRef}
                                disabled={uploadingPhoto}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {uploadingPhoto && <p className="text-muted-foreground text-xs">Enviando foto…</p>}
                            {photoError && <p className="text-sm text-red-600">{photoError}</p>}
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
