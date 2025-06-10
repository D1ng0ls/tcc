import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { Toast } from 'primereact/toast';


interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
  const mgs = usePage().props;
  const toast = useRef(null);

  useEffect(() => {
    if (mgs?.errors) {
      Object.values(mgs.errors).forEach((error) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: error,
          life: 5000
        });
      });
    }

    if (mgs?.flash?.error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: mgs.flash.error,
        life: 5000
      });
    }

    if (mgs?.flash?.success) {
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: mgs.flash.success,
        life: 3000
      });
    }

    if (mgs?.flash?.info) {
      toast.current?.show({
        severity: 'info',
        summary: 'Informação',
        detail: mgs.flash.info,
        life: 4000
      });
    }

    if (mgs?.flash?.warn) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: mgs.flash.warn,
        life: 4000
      });
    }
  }, [mgs.errors, mgs.flash]);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <Toast ref={toast} />
      {children}
    </AppLayoutTemplate>
  );
}
