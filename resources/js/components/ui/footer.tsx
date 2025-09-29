export default function FooterLayout() {
    return (
        <footer className="p-4 bg-primary-foreground">
            <p className="text-muted-foreground text-sm text-center">© {new Date().getFullYear()} Cidade Inteligente. Todos os direitos reservados.</p>
        </footer>
    );
}