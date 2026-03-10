import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './utils';

interface DataPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
    isToRemoveBorder?: boolean;
}

export default function DataPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel = 'items',
    isToRemoveBorder,
}: DataPaginationProps) {
    if (totalPages <= 1) return null;

    const safePage = Math.min(currentPage, totalPages);
    const startItem = (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, totalItems);

    const delta = 2;
    const start = Math.max(1, safePage - delta);
    const end = Math.min(totalPages, safePage + delta);
    const pageNumbers = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
    );

    return (

        <div
            className={cn(
                "flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-5 py-3",
                isToRemoveBorder && "border-none"
            )}
        >
            <p className="text-slate-500 text-sm">
                Showing <span className="font-medium text-slate-700">{startItem}–{endItem}</span> of <span className="font-medium text-slate-700">{totalItems}</span> {itemLabel}
            </p>
            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    onClick={() => onPageChange(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* First page + ellipsis */}
                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="w-8 h-8 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && <span className="px-1 text-slate-400 text-sm">…</span>}
                    </>
                )}

                {/* Page number buttons */}
                {pageNumbers.map(n => (
                    <button
                        key={n}
                        onClick={() => onPageChange(n)}
                        className={`w-8 h-8 rounded-lg text-sm transition-colors ${n === safePage
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {n}
                    </button>
                ))}

                {/* Last page + ellipsis */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400 text-sm">…</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

