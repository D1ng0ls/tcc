import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';

export default function CreateComplaints() {

    const { cities, states, categories, neighborhoods } = usePage().props;

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
            title: 'Single',
            href: '/complaints/single',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Single" />
            <div>
                testando
            </div>
        </AppLayout>
    );
}
