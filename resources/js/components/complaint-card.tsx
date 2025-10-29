import { Link } from '@inertiajs/react';
import { MapPin, Clock, User } from 'lucide-react';

export default function ComplaintCard({ complaint, auth }: { complaint: any, auth: any }) {
    const statusStyles = {
        1: {
            badge: 'bg-sky-100 text-sky-800',
            border: 'bg-sky-500',
        },
        2: {
            badge: 'bg-yellow-100 text-yellow-800',
            border: 'bg-yellow-300',
        },
        3: {
            badge: 'bg-purple-200 text-purple-700',
            border: 'bg-purple-500',
        },
        4: {
            badge: 'bg-green-100 text-green-800',
            border: 'bg-green-500',
        },
        5: {
            badge: 'bg-red-200 text-red-700',
            border: 'bg-red-500',
        },
        6: {
            badge: 'bg-stone-200 text-stone-700',
            border: 'bg-stone-500',
        },
    };

    return (
        <div key={complaint.id} className="relative w-full bg-card border border-border rounded-lg shadow-sm bg-primary-foreground">
            {/* Borda superior baseada no status */}
            <div className={`absolute top-0 left-0 w-full h-2 rounded-t-lg ${statusStyles[complaint?.status_id]?.border}`}></div>

            <div className="p-6 pt-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">#{complaint.id}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[complaint?.status_id]?.badge}`}>
                        {complaint?.status?.name?.toUpperCase()}
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground">{complaint?.title}</h2>

                <p className="mt-3 text-muted-foreground">
                    {complaint.description.length > 150 ? complaint.description.substring(0, 150) + '...' : complaint.description}
                </p>

                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin size={16} /><span>{complaint?.department?.municipality?.city?.name}</span></div>
                    <div className="flex items-center gap-1.5"><Clock size={16} /><span>{new Date(complaint?.created_at).toLocaleDateString()}</span></div>
                    {(auth.user?.role === 'admin' || !!auth.user?.active) && (
                        <div className="flex items-center gap-1.5"><User size={16} /><span>{complaint?.user?.name}</span></div>
                    )}
                    <div className="flex items-center gap-1.5"> <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">{complaint?.department?.name}</span></div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50">
                    <Link href={route('complaints.show', complaint.id)}>
                        <button className="px-6 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                            Ver detalhes
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}