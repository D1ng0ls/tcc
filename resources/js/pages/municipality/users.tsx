import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Headline from '@/components/ui/headline';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasswordRequirements from '@/components/password-requirements';

type Member = { id: number; name: string; email: string; department_id: number; department?: { id: number; name: string } };
type Department = { id: number; name: string };

// Pessoas dos departamentos: cada uma entra no painel com o próprio e-mail e só atende as
// reclamações do departamento dela. Só o master (login da prefeitura) vê esta tela.
export default function DepartmentUsers() {
    const { users, departments } = usePage().props as unknown as { users: Member[]; departments: Department[] };
    const [search, setSearch] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);

    const breadcrumbs: (BreadcrumbItem & { current?: boolean })[] = [{ title: 'Usuários', href: '/users', current: true }];

    const createForm = useForm({ name: '', email: '', department_id: null as number | null, password: '' });
    const editForm = useForm({ name: '', email: '', department_id: null as number | null, password: '' });

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post(route('municipality.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setIsFormVisible(false);
            },
        });
    };

    const openEdit = (member: Member) => {
        setEditing(member);
        editForm.clearErrors();
        editForm.setData({ name: member.name, email: member.email, department_id: member.department_id, password: '' });
    };

    const handleUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        editForm.patch(route('municipality.users.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteConfirm = (member: Member) => {
        confirmDialog({
            message: 'A pessoa perde o acesso ao painel. O que ela já fez continua no histórico das reclamações.',
            header: `Remover ${member.name}?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => router.delete(route('municipality.users.destroy', member.id), { preserveScroll: true }),
        });
    };

    const term = search.toLowerCase();
    const filtered = (users || []).filter(
        (member) =>
            member.name.toLowerCase().includes(term) ||
            member.email.toLowerCase().includes(term) ||
            (member.department?.name ?? '').toLowerCase().includes(term),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ConfirmDialog />
            <Head title="Usuários dos Departamentos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Headline
                    title="Usuários dos Departamentos 👥"
                    description="Cada pessoa entra no painel com o próprio e-mail e atende só as reclamações do departamento dela"
                />

                <div className="border-border bg-primary-foreground flex flex-col items-center justify-between gap-4 rounded-xl border p-8">
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex w-full flex-row gap-2">
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nome, e-mail ou departamento"
                                className="border-border w-full rounded-lg border p-2"
                            />
                            <Button
                                type="button"
                                label={(isFormVisible ? 'Cancelar' : (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <Plus /> Adicionar
                                    </div>
                                )) as any}
                                className="w-xs"
                                onClick={() => setIsFormVisible(!isFormVisible)}
                            />
                        </div>

                        {isFormVisible && (
                            <form onSubmit={handleCreate} className="border-border mt-2 flex flex-col gap-4 border-t pt-4">
                                <MemberFields form={createForm} departments={departments} passwordLabel="Senha inicial" />
                                <p className="text-muted-foreground text-sm">
                                    Passe o e-mail e a senha inicial para a pessoa. Ela entra pelo login da prefeitura e pode trocar a senha em
                                    "Minha conta".
                                </p>
                                <Button type="submit" label={createForm.processing ? 'Salvando...' : 'Salvar'} className="self-end" disabled={createForm.processing} />
                            </form>
                        )}
                    </div>

                    <div className="bg-background dark:bg-muted border-border w-full overflow-hidden rounded-lg border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted dark:bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Departamento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-muted dark:divide-muted-foreground divide-y">
                                    {filtered.map((member) => (
                                        <tr key={member.id} className="group hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">{member.name}</td>
                                            <td className="text-muted-foreground px-6 py-4 whitespace-nowrap">{member.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{member.department?.name}</td>
                                            <td className="flex items-center justify-center gap-2 px-6 py-4 whitespace-nowrap opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => openEdit(member)}
                                                    className="bg-primary-foreground text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded px-3 py-1 text-sm"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteConfirm(member)}
                                                    className="text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded bg-red-500 px-3 py-1 text-sm"
                                                >
                                                    Remover
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-muted-foreground px-6 py-6 text-center">
                                                {(users || []).length === 0
                                                    ? 'Ninguém cadastrado ainda. Enquanto um departamento não tiver pessoas, as reclamações dele ficam só com a prefeitura.'
                                                    : 'Nenhum usuário encontrado'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                visible={!!editing}
                onHide={() => {
                    setEditing(null);
                    editForm.reset();
                }}
                header={`Editar ${editing?.name ?? ''}`}
                className="w-full max-w-xl"
            >
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <MemberFields form={editForm} departments={departments} passwordLabel="Nova senha (deixe em branco para manter)" />
                    <Button type="submit" className="self-end" disabled={editForm.processing} label="Salvar" />
                </form>
            </Dialog>
        </AppLayout>
    );
}

function MemberFields({ form, departments, passwordLabel }: { form: any; departments: Department[]; passwordLabel: string }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <InputText value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Nome da pessoa" />
                <InputError message={form.errors.name} />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">E-mail</label>
                <InputText type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="nome@prefeitura.gov.br" />
                <InputError message={form.errors.email} />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Departamento</label>
                <Dropdown
                    value={form.data.department_id}
                    options={departments}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => form.setData('department_id', e.value)}
                    placeholder="Escolha o departamento"
                    filter
                    className="w-full"
                />
                <InputError message={form.errors.department_id} />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{passwordLabel}</label>
                <PasswordInput
                    value={form.data.password}
                    onChange={(e: any) => form.setData('password', e.target.value)}
                    autoComplete="new-password"
                    placeholder="Senha"
                />
                {form.data.password && <PasswordRequirements value={form.data.password} className="mt-1" />}
                <InputError message={form.errors.password} />
            </div>
        </div>
    );
}
