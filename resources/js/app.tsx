    import '../css/app.css';

    import { createInertiaApp, router } from '@inertiajs/react';
    import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
    import { createRoot } from 'react-dom/client';
    import { initializeTheme } from './hooks/use-appearance';
    
    import 'primereact/resources/primereact.min.css';
    import { addLocale, locale } from 'primereact/api';

    // Calendários e componentes do PrimeReact em português.
    addLocale('pt-BR', {
        firstDayOfWeek: 0,
        dayNames: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
        dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
        monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        today: 'Hoje',
        clear: 'Limpar',
        accept: 'Sim',
        reject: 'Não',
        emptyMessage: 'Nenhum resultado encontrado',
        emptyFilterMessage: 'Nenhum resultado encontrado',
    });
    locale('pt-BR');

    const appName = import.meta.env.VITE_APP_NAME || 'Cidade Inteligente';

    createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup({ el, App, props }) {
            const root = createRoot(el);

            root.render(<App {...props} />);
        },
        progress: {
            color: '#4B5563',
        },
    });

    // Resposta que não é do Inertia (ex.: verificação do Cloudflare depois de muito tempo com a
    // aba parada): por padrão o Inertia abre essa página por cima da tela. Em vez disso,
    // carrega a página de verdade no navegador, que resolve a verificação normalmente.
    router.on('invalid', (event) => {
        event.preventDefault();
        window.location.href = event.detail.response.request?.responseURL || window.location.href;
    });

    // This will set light / dark mode on load...
    initializeTheme();

    