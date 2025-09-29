import { Toast } from 'primereact/toast';
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function GlobalToast() {
    const { props } = usePage();
    console.log(props);
    const toast = useRef(null);

    useEffect(() => {
        if (props?.errors) {
            Object.values(props.errors).forEach((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: error,
                    life: 5000
                });
            });
        }

        if (props?.flash?.error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: props.flash.error,
                life: 5000
            });
        }

        if (props?.flash?.success) {
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: props.flash.success,
                life: 3000
            });
        }

        if (props?.flash?.info) {
            toast.current?.show({
                severity: 'info',
                summary: 'Informação',
                detail: props.flash.info,
                life: 4000
            });
        }

        if (props?.flash?.warn) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Aviso',
                detail: props.flash.warn,
                life: 4000
            });
        }
    }, [props.errors, props.flash]);

    return <Toast ref={toast} />;
}