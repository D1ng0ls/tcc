import AppLogo from "../app-logo";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "./button";

export default function Header() {
    const { auth } = usePage().props as any;
    return (
        <header className="p-4 flex items-center justify-between bg-primary-foreground">
            <AppLogo className="flex items-center gap-2" textClassName="!text-base" />
            {!auth.user ?
                <div className="flex items-center gap-4">
                    <Link href={route('login')}>
                        <Button variant="outline" className="cursor-pointer">Login</Button>
                    </Link>
                    <Link href={route('register')}>
                        <Button variant="default" className="cursor-pointer">Register</Button>
                    </Link>
                </div>
                :
                <div className="flex items-center gap-4">
                    <Link href={route('dashboard')}>
                        <Button variant="outline" className="cursor-pointer">Dashboard</Button>
                    </Link>
                </div>
            }
        </header>
    );
}