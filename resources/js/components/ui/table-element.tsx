import { Link } from "@inertiajs/react";
import { Trash, Download, Pencil, Eye, Upload, Loader2 } from "lucide-react";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function TableElement({ filtered, header, loading }: { filtered: any, header: any, loading: boolean }) {
    const icons = {
        trash: Trash,
        download: Download,
        pencil: Pencil,
        eye: Eye,
        upload: Upload,
    };

    function getProperty<T, K extends string>(obj: T, path: K): any {
        if (!path) return undefined;
        const keys = path.split('.');
        let result: any = obj;
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key as keyof typeof result];
            } else {
                return undefined;
            }
        }
        return result;
    }

    function formatDocument(document: string) {
        if (document.length === 11) {
            return document.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }

        if (document.length === 14) {
            return document.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }

        return document;
    }

    return (
        <>
            {
                filtered.length > 0 ? (
                    <div className='rounded-xl border  overflow-auto'>
                        <table className="w-full text-left">
                            <thead>
                                <tr className='border-b font-bold'>
                                    {header.map((item: { title: string; key: string; }) => (
                                        <th key={item.key} className="p-4">{item.title}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((f: { id: React.Key | null | undefined; title: any; client: { name: any; }; amount: any; deadline: any; created_at: any; }) => (
                                    <tr key={f.id} className='border-b'>
                                        {header.map((item: {
                                            actions?: Array<{ icon: string; action: (arg: any) => void; key?: string; className?: string; href?: string }>;
                                            title: string;
                                            key?: string;
                                            type?: string;
                                        }) => {
                                            const cellKey = item.key || item.title;
                                            const cellValue = item.key ? getProperty(f, item.key) : null;

                                            return (
                                                <td key={cellKey} className="p-4">
                                                    {item.type === 'date' && cellValue
                                                        ? new Date(cellValue as string).toLocaleString('pt-BR').split(',')[0]
                                                        : item.type === 'amount' && cellValue
                                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cellValue as number)
                                                            : item.type === 'document' && cellValue
                                                                ? formatDocument(cellValue as string)
                                                                : cellValue}

                                                    {item.actions && (
                                                        <div className="flex flex-row gap-2">
                                                            {loading ?
                                                                <Loader2 className='animate-spin' />
                                                                :
                                                                item.actions.map((actionItem, index) => {
                                                                    const IconComponent = icons[actionItem.icon as keyof typeof icons];

                                                                    const actionArgument = actionItem.key ? getProperty(f, actionItem.key) : f;

                                                                    return (
                                                                        <button
                                                                            key={`${actionItem.icon}-${index}`}
                                                                            onClick={() => actionItem.action(actionArgument)}
                                                                            className="cursor-pointer"
                                                                            disabled={loading}
                                                                        >
                                                                            {IconComponent && <IconComponent className={actionItem.className} />}
                                                                        </button>
                                                                    );
                                                                })}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12 border rounded-xl">
                        Você ainda não possui dados cadastrados.
                    </div>
                )
            }
        </>
    );
}