import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { useEffect } from 'react';
import GlobalToast from '@/components/ui/global-toast';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
  const mgs = usePage().props;
  const toast = useRef(null);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <GlobalToast />
      {children}
    </AppLayoutTemplate>
  );
}
