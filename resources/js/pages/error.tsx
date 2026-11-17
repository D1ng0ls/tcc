import AppLogoIcon from '@/components/app-logo-icon';
import { Head, Link } from '@inertiajs/react';

// Páginas de erro em português, com a identidade do sistema (fluxos de falha dos casos de uso).
const TEXTS: Record<number, { title: string; description: string }> = {
    403: { title: 'Acesso não permitido', description: 'Você não tem permissão para acessar esta página ou realizar esta ação.' },
    404: { title: 'Página não encontrada', description: 'O endereço acessado não existe ou foi removido.' },
    500: { title: 'Algo deu errado', description: 'Não foi possível carregar esta página agora. Tente novamente em instantes.' },
    503: { title: 'Sistema em manutenção', description: 'Estamos fazendo uma atualização. Volte em alguns minutos.' },
};

export default function ErrorPage({ status, message }: { status: number; message?: string | null }) {
    const text = TEXTS[status] ?? TEXTS[500];

    return (
        <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
            <Head title={text.title} />
            <AppLogoIcon className="size-12 fill-current text-blue-500" />
            <p className="text-muted-foreground text-sm font-semibold tracking-widest">ERRO {status}</p>
            <h1 className="text-3xl font-bold">{text.title}</h1>
            <p className="text-muted-foreground max-w-md">{message || text.description}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="border-border hover:bg-muted cursor-pointer rounded-xl border px-4 py-2 transition-colors"
                >
                    Voltar
                </button>
                <Link href="/" className="rounded-xl bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
                    Ir para o início
                </Link>
            </div>
        </div>
    );
}
