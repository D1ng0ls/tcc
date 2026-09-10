import { Eye, EyeOff } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { forwardRef, useState } from 'react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    inputClassName?: string;
};

/**
 * Input de senha com toggle olho mostrar/ocultar.
 * Mantém compatibilidade com PrimeReact InputText (mesma estética dos outros campos).
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    { className, inputClassName, ...props },
    ref,
) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={`relative ${className ?? ''}`}>
            <InputText
                {...(props as any)}
                ref={ref as any}
                type={visible ? 'text' : 'password'}
                className={`w-full rounded-xl! border border-border! bg-background! p-2 pr-10 text-foreground! ${inputClassName ?? ''}`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
});

export default PasswordInput;
