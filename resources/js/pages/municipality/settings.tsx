import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasswordRequirements from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configurações',
        href: '/settings',
    },
];

export default function MunicipalitySettings() {
    const { auth } = usePage().props as any;
    const getInitials = useInitials();

    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(auth.user?.photo_url || null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const profileForm = useForm<{
        name: string;
        email: string;
        cnpj: string;
    }>({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        cnpj: auth.user?.cnpj ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setPhotoError(null);
        setUploadingPhoto(true);

        const formData = new FormData();
        formData.append('photo', file);

        router.post(route('municipality.settings.photo.upload'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onError: (errs) => {
                setPhotoError((errs as any).photo ?? 'Erro ao enviar imagem.');
                setPreview(auth.user?.photo_url || null);
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
        router.delete(route('municipality.settings.photo.remove'), {
            preserveScroll: true,
            onSuccess: () => setPreview(null),
            onFinish: () => setUploadingPhoto(false),
        });
    };

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.put(route('municipality.settings.update'), { preserveScroll: true });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('municipality.settings.password'), {
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
            <Head title="Configurações" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="border-border bg-primary-foreground rounded-xl border p-6">
                    <HeadingSmall title="Perfil da prefeitura" description="Atualize as informações públicas da sua prefeitura." />

                    <form onSubmit={submitProfile} className="mt-6 space-y-6">
                        <div className="flex flex-col items-start gap-4">
                            <div className="flex items-center gap-4">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Foto da prefeitura"
                                        className={`h-20 w-20 rounded-full border object-cover transition-opacity ${uploadingPhoto ? 'opacity-50' : ''}`}
                                    />
                                ) : (
                                    <div className="bg-accent flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-lg">
                                        {getInitials(auth.user?.name || '')}
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
                                className="w-full rounded-xl! border border-border! bg-background! p-2 text-foreground!"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                required
                                autoComplete="organization"
                                placeholder="Nome da prefeitura"
                            />
                            <InputError className="mt-2" message={profileForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <InputText
                                id="email"
                                type="email"
                                className="w-full rounded-xl! border border-border! bg-background! p-2 text-foreground!"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="email@prefeitura.gov"
                            />
                            <InputError className="mt-2" message={profileForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <InputMask
                                id="cnpj"
                                className="w-full rounded-xl! border border-border! bg-background! p-2 text-foreground!"
                                value={profileForm.data.cnpj}
                                onChange={(e) => profileForm.setData('cnpj', e.value || '')}
                                mask="99.999.999/9999-99"
                                placeholder="00.000.000/0000-00"
                            />
                            <InputError className="mt-2" message={profileForm.errors.cnpj} />
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
                    <HeadingSmall title="Atualizar senha" description="Use uma senha longa e única para manter o acesso seguro." />

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
