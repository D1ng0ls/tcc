import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { usePage } from '@inertiajs/react';

export function UserInfo({ user: account, showEmail = false }: { user: any; showEmail?: boolean }) {
    const getInitials = useInitials();
    const { auth } = usePage().props as any;
    // Usuário de departamento: mostra a pessoa (e o departamento) com a foto da prefeitura.
    const member = auth?.member;
    const user = member ? { ...account, name: member.name, email: `${member.department_name} · ${member.email}` } : account;
    const photoUrl = user?.photo_url ? String(user.photo_url) : undefined;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {photoUrl ? <AvatarImage src={photoUrl} alt={user?.name ?? 'Avatar'} /> : null}
                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user?.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user?.email}</span>}
            </div>
        </>
    );
}
