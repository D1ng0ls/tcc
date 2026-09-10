import { Check, X } from 'lucide-react';

type Rule = {
    label: string;
    test: (value: string) => boolean;
};

const rules: Rule[] = [
    { label: 'No mínimo 8 caracteres', test: (v) => v.length >= 8 },
    { label: 'Uma letra maiúscula (A-Z)', test: (v) => /[A-Z]/.test(v) },
    { label: 'Uma letra minúscula (a-z)', test: (v) => /[a-z]/.test(v) },
    { label: 'Um número (0-9)', test: (v) => /[0-9]/.test(v) },
    { label: 'Um caractere especial (ex.: ! @ # $)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function PasswordRequirements({ value, className = '' }: { value: string; className?: string }) {
    return (
        <ul className={`grid gap-1 text-xs sm:grid-cols-2 ${className}`} aria-live="polite">
            {rules.map((rule) => {
                const ok = rule.test(value);
                return (
                    <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 transition-colors ${
                            ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                        }`}
                    >
                        {ok ? <Check className="h-3.5 w-3.5 flex-shrink-0" /> : <X className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span>{rule.label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

export const passwordRules = rules;

export const isPasswordValid = (value: string) => rules.every((r) => r.test(value));
