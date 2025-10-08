import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ paginatedPosts, handlePreviousPage, handleNextPage }: any) {
    return (
        <>
            {paginatedPosts.links && paginatedPosts.links.length > 3 && (
                <div className="pt-4 flex justify-center gap-6 items-center py-5">
                    <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        size="sm"
                        disabled={paginatedPosts.current_page <= 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronLeft />
                        Anterior
                    </Button>
                    <div className="flex flex-col items-center text-sm gap-1">
                        <p>Página {paginatedPosts.current_page} de {paginatedPosts.last_page}</p>
                        <p className="text-xs">Mostrando {paginatedPosts.from} a {paginatedPosts.to} de {paginatedPosts.total} resultados</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={paginatedPosts.current_page >= paginatedPosts.last_page}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Próxima
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </>
    );
}