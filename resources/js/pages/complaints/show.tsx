import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';

export default function CreateComplaints() {

    const { cities, states, categories, neighborhoods, complaint } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        state_id: '',
        city_id: '',
        neighborhood_id: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `Reclamação #${complaint.id}`,
            href: `complaints/${complaint.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reclamação #${complaint.id}`} />
            <div>
                testando
            </div>
        </AppLayout>
    );
}
