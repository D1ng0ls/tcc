import GlobalToast from '@/components/ui/global-toast';
import HeaderLayout from '@/components/ui/header';
import FooterLayout from '@/components/ui/footer';

export default function AuthLayout({ children, className }: { children: any; className?: string }) {
    return (
        <main>
            <GlobalToast />
            <HeaderLayout />
            <section className={className}>
                {children}
            </section>
            <FooterLayout />
        </main>
    );
}
