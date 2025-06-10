import { InputText } from 'primereact/inputtext';
import { Link } from '@inertiajs/react';
import { Plus, Loader2 } from 'lucide-react';

export default function SearchInput({ search, setSearch, title, href, loading }: { search: string; setSearch: (search: string) => void; title: string; href: string, loading: boolean }) {
    return (
        <div className='flex flex-row gap-6'>
            <InputText
                type="text"
                placeholder={`Pesquisar ${title}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-border! rounded-xl! bg-background! text-foreground!"
            />
            {loading ? (
                <div className='flex flex-row border rounded-xl items-center px-3 text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400  transition-all cursor-not-allowed grayscale-50'>
                    <Loader2 className='text-sm animate-spin' />
                </div>
            ) : (
                <Link href={href} className='flex flex-row border gap-2 rounded-xl items-center px-2 text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-[0.7] transition-all cursor-pointer'>
                    <Plus className='text-sm' />
                    <span className='text-sm'>Adicionar</span>
                </Link>
            )}
        </div>
    );
}