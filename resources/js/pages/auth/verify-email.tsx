// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status, email, mailLoggedLocally }: { status?: string; email?: string; mailLoggedLocally?: boolean }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verifique seu e-mail"
            description={`Enviamos um link de confirmação para ${email ?? 'o e-mail informado no cadastro'}. Clique nele para liberar o acesso à plataforma.`}
        >
            <Head title="Verificar e-mail" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Um novo link de verificação foi enviado para o e-mail informado no cadastro.
                </div>
            )}

            {mailLoggedLocally && (
                <div className="text-muted-foreground mb-4 rounded-md border border-dashed p-3 text-center text-xs">
                    Ambiente local: nenhum e-mail é enviado de verdade. O link de verificação fica gravado em{' '}
                    <code>storage/logs/laravel.log</code>.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Reenviar e-mail de verificação
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Desconectar
                </TextLink>
            </form>
        </AuthLayout>
    );
}
