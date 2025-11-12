import { Building2 } from 'lucide-react';

export default function AppLogo({textClassName='', className=''}: {textClassName?: string, className?: string}) {
    return (
        <div className='flex flex-row items-center gap-2'>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <Building2 className="rounded-md text-blue-500" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className={`mb-0.5 truncate leading-none font-semibold ${textClassName}`}>Cidade Inteligente</span>
            </div>
        </div>
    );
}
