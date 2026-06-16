import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function UserInfo({ user, showEmail = false }: { user: any; showEmail?: boolean }) {
    const getInitials = useInitials();
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
