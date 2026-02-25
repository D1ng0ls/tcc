import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Check, UploadCloud, X } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useState } from 'react';

export default function CreateComplaints() {
    const { states, categories, auth } = usePage().props as any;
    const [cities, setCities] = useState<any[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [previews, setPreviews] = useState<{ url: string; name: string; type: string }[]>([]);
    const [fileErrors, setFileErrors] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        department_id: 0 || undefined,
        state_id: auth.user?.city?.state_id || undefined,
        city_id: auth.user?.city?.id || undefined,
        neighborhood_id: auth.user?.neighborhood?.id || undefined,
        district: '',
        address: '',
        images: [] as File[],
    });

    const MAX_TOTAL_FILES = 5;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const ALLOWED_FILE_TYPES = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-ms-wmv',
        'video/x-flv',
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Nova Reclamação',
            href: '/complaints/create',
        },
    ];

    const submit = (e: any) => {
        e.preventDefault();
        post(route('complaints.store'), {
            onFinish: () => reset(),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileErrors([]); // Limpa os erros anteriores a cada nova seleção
        const files = e.target.files;

        if (!files) return;

        const newFiles = Array.from(files);
        const currentFileCount = data.images.length;
        const errors: string[] = [];

        if (currentFileCount + newFiles.length > MAX_TOTAL_FILES) {
            errors.push(`Você só pode enviar no máximo ${MAX_TOTAL_FILES} arquivos.`);
            setFileErrors(errors);
            return;
        }

        const validFiles: File[] = [];

        newFiles.forEach((file) => {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errors.push(`"${file.name}": Tipo de arquivo não permitido.`);
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                errors.push(`"${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setFileErrors(errors);
        }

        if (validFiles.length > 0) {
            const allFiles = [...data.images, ...validFiles];
            setData('images', allFiles);

            const newPreviews = validFiles.map((file) => ({
                url: URL.createObjectURL(file),
                name: file.name,
                type: file.type,
            }));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        URL.revokeObjectURL(previews[index].url);

        const remainingFiles = data.images.filter((_, i) => i !== index);
        const remainingPreviews = previews.filter((_, i) => i !== index);

        setData('images', remainingFiles);
        setPreviews(remainingPreviews);
    };

    useEffect(() => {
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    useEffect(() => {
        if (data.state_id) {
            axios.get(route('cities.index', { state: data.state_id })).then((response: any) => {
                setCities(response.data);
            });
        } else {
            setCities([]);
        }
    }, [data.state_id]);

    useEffect(() => {
        if (data.city_id) {
            axios.get(route('cities.neighborhoods', { city: data.city_id })).then((response: any) => {
                setNeighborhoods([
                    ...response.data,
                    {
                        name: 'Outro',
                        id: null,
                    },
                ]);
            });

            axios.get(route('cities.departments', { city: data.city_id })).then((response: any) => {
                setDepartments(response.data);
            });
        } else {
            setNeighborhoods([]);
            setDepartments([]);
            setData('neighborhood_id', undefined);
            setData('department_id', undefined);
        }
    }, [data.city_id]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Reclamação" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                    <div className="border-border bg-primary-foreground col-span-2 rounded-xl border p-6">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold">📝 Nova Reclamação</h2>
                            <p className="text-md text-muted-foreground">Relate um problema em sua cidade e ajude a torná-la melhor</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Título</Label>
                                    <InputText
                                        id="title"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Título"
                                    />
                                    <span>{errors.title}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <InputTextarea
                                        id="description"
                                        required
                                        autoFocus
                                        tabIndex={2}
                                        autoComplete="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Descrição"
                                        rows={8}
                                        style={{ resize: 'none' }}
                                    />
                                    <span>{errors.description}</span>
                                </div>
                                {/* Bloco de Upload de Arquivos com Preview */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="images">Fotos e Vídeos</Label>
                                    <label
                                        htmlFor="file-upload"
                                        className="border-border bg-background hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors"
                                    >
                                        <UploadCloud className="text-muted-foreground h-10 w-10" />
                                        <p className="text-foreground mt-2 font-semibold">Clique para enviar ou arraste e solte</p>
                                        <p className="text-muted-foreground text-sm">Imagens ou vídeos (PNG, JPG, MP4, etc.)</p>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        // A propriedade 'accept' é só uma sugestão para o navegador, a validação real está no JS
                                        accept={ALLOWED_FILE_TYPES.join(',')}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {/* Erros que vêm do Backend (Inertia) */}
                                    {errors.images && <span className="mt-1 text-sm text-red-500">{errors.images}</span>}

                                    {/* Erros em tempo real do Frontend */}
                                    {fileErrors.length > 0 && (
                                        <div className="mt-2 flex flex-col gap-1">
                                            {fileErrors.map((error, index) => (
                                                <span key={index} className="text-sm text-red-500">
                                                    - {error}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bloco de Grid de Previews ATUALIZADO */}
                                    {previews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="border-border relative aspect-square rounded-lg border bg-black">
                                                    {preview.type.startsWith('image/') ? (
                                                        <img
                                                            src={preview.url}
                                                            alt={`Preview ${preview.name}`}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={preview.url}
                                                            muted
                                                            loop
                                                            autoPlay
                                                            playsInline
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="border-border bg-destructive text-destructive-foreground absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110"
                                                        aria-label={`Remover ${preview.name}`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="state_id">Estado</Label>
                                        <Dropdown
                                            id="state_id"
                                            value={data.state_id || undefined}
                                            options={states as any}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('state_id', e.value)}
                                            placeholder="Selecione o estado"
                                            filter
                                            showClear
                                            className="bg-background! w-full! rounded-xl!"
                                            panelClassName="bg-background!"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="city_id">Cidade</Label>
                                        <Dropdown
                                            id="city_id"
                                            value={data.city_id}
                                            options={(cities as any) || []}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('city_id', e.value)}
                                            placeholder="Selecione a cidade"
                                            filter
                                            showClear
                                            className="bg-background! w-full! rounded-xl!"
                                            panelClassName="bg-background!"
                                            required
                                            disabled={!data.state_id}
                                        />
                                    </div>
                                    <div className={`flex flex-col gap-2`}>
                                        <Label htmlFor="neighborhood_id">Bairro</Label>
                                        <Dropdown
                                            id="neighborhood_id"
                                            value={data.neighborhood_id}
                                            options={(neighborhoods as any) || []}
                                            optionLabel="name"
                                            optionValue="id"
                                            onChange={(e) => setData('neighborhood_id', e.value)}
                                            placeholder="Selecione o bairro"
                                            filter
                                            showClear
                                            className="bg-background! w-full! rounded-xl!"
                                            panelClassName="bg-background!"
                                            required
                                            disabled={!data.city_id}
                                        />
                                        {data.neighborhood_id === null && (
                                            <InputText
                                                id="district"
                                                value={data.district}
                                                onChange={(e) => setData('district', e.target.value)}
                                                placeholder="Digite o bairro"
                                                className="bg-background w-full rounded-xl"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="address">Endereço</Label>
                                        <InputText
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Digite o endereço"
                                            className="bg-background w-full rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={`flex flex-col gap-2`}>
                                    <Label htmlFor="department_id">Departamento</Label>
                                    <Dropdown
                                        id="department_id"
                                        value={data.department_id}
                                        options={(departments as any) || []}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={(e) => setData('department_id', e.value)}
                                        placeholder="Selecione o departamento"
                                        filter
                                        showClear
                                        className="bg-background! w-full! rounded-xl!"
                                        panelClassName="bg-background!"
                                        required
                                        disabled={!data.city_id}
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" label="Enviar" className="w-full" disabled={processing} />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="border-border bg-primary-foreground rounded-xl border p-6">
                        <div className="border-border border-b pb-2">
                            <h2 className="text-xl font-bold">💡 Dicas</h2>
                            <p className="text-md text-muted-foreground"> Dicas para uma boa reclamação</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            <ul className="flex list-inside list-disc flex-col gap-1.5">
                                <li className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    Seja específico no título
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span>Inclua fotos do problema</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    Descreva como afeta a comunidade
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    Informe a localização exata
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    Mencione se há riscos à segurança
                                </li>
                            </ul>
                        </div>
                        <div className="border-border mt-8 border-b pb-2">
                            <h2 className="text-xl font-bold">📋 Exemplos</h2>
                            <p className="text-md text-muted-foreground">Exemplos por categoria</p>
                        </div>
                        <div className="border-primary mt-4 ml-2 flex flex-col gap-1.5 border-l-2 pl-4">
                            <p>
                                <span className="font-bold">Vias Públicas:</span> Buracos, pavimento danificado
                            </p>
                            <p>
                                <span className="font-bold">Iluminação:</span> Postes queimados, ruas escuras
                            </p>
                            <p>
                                <span className="font-bold">Limpeza:</span> Lixo acumulado, entulho
                            </p>
                            <p>
                                <span className="font-bold">Transporte:</span> Pontos de ônibus danificados
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
