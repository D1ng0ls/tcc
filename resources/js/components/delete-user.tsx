import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InputText } from 'primereact/inputtext';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm<Required<{ password: string }>>({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Deletar conta" description="Esta ação irá excluir permanentemente sua conta e todos os recursos vinculados a ela." />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Atenção!</p>
                    <p className="text-sm">Prossiga com cautela, esta ação não pode ser desfeita.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className='cursor-pointer'>Deletar conta</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Tem certeza de que deseja fazer isso</DialogTitle>
                        <DialogDescription>
                            Após a exclusão, todos os recursos e dados vinculados serão permanentemente apagados.<br/><br/>
                            Insira sua senha para confirmar a exclusão permanente da sua conta.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Senha
                                </Label>

                                <InputText
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Senha"
                                    autoComplete="current-password"
                                    className="w-full border border-border! rounded-xl! p-2 bg-background! text-foreground!"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal} className='cursor-pointer'>
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit" className='cursor-pointer'>Deletar conta</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
