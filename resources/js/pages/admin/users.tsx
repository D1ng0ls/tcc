import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminUsers() {
    const { users, filters } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search ?? '');

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/admin/users',
        },
    ];

    // Filtra conforme digita (sem exigir Enter), preservando o input focado
    const onSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('admin.users.index'),
            { search: value },
            { preserveState: true, replace: true, preserveScroll: true, only: ['users', 'filters'] },
        );
    };

    const handleDelete = (user: any) => {
        if (!window.confirm(`Excluir a conta de ${user.name}? Esta ação não pode ser desfeita.`)) {
            return;
        }
        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    };

    const rows = users?.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cidadãos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-row flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Cidadãos 👤</h1>
                        <p className="text-md text-muted-foreground">Visualize e remova contas de cidadãos</p>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Buscar por nome ou e-mail…"
                        className="w-full max-w-xs border border-border rounded-xl p-2 bg-background text-foreground"
                    />
                </div>

                <div className="flex flex-col flex-wrap justify-between items-center gap-4 p-8 border border-border rounded-xl bg-primary-foreground">
                    <div className="bg-background dark:bg-muted rounded-lg border border-border w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Cidade</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase">Reclamações</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted dark:divide-muted-foreground">
                                    {rows.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-muted group">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {user.city ? `${user.city.name}${user.city.state ? ' - ' + user.city.state.uf : ''}` : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-muted-foreground">{user.complaints_count ?? 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap flex items-center justify-center gap-2 group-hover:opacity-100 opacity-0">
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="px-3 py-1 rounded text-sm text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground bg-red-600"
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center">
                                                Nenhum cidadão encontrado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {users?.last_page > 1 && (
                        <div className="flex items-center justify-center gap-3 w-full">
                            <button
                                disabled={!users.prev_page_url}
                                onClick={() => router.get(users.prev_page_url, {}, { preserveScroll: true, preserveState: true })}
                                className="px-3 py-1 rounded text-sm border border-border disabled:opacity-40 cursor-pointer disabled:cursor-default"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Página {users.current_page} de {users.last_page}
                            </span>
                            <button
                                disabled={!users.next_page_url}
                                onClick={() => router.get(users.next_page_url, {}, { preserveScroll: true, preserveState: true })}
                                className="px-3 py-1 rounded text-sm border border-border disabled:opacity-40 cursor-pointer disabled:cursor-default"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
