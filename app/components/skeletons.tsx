export function Bone({ className = "" }: { className?: string }) {
    return <div className={`rounded bg-surface-3 ${className}`} />;
}

export function SkeletonPage({ children }: { children: React.ReactNode }) {
    return (
        <div aria-busy="true" aria-label="Carregando" className="animate-pulse">
            {children}
        </div>
    );
}

export function HeaderSkeleton({ action = false, description = false }: { action?: boolean; description?: boolean }) {
    return (
        <div className="mb-5">
            <div className="flex items-center gap-3">
                <Bone className="h-7 w-44" />
                {action && <Bone className="h-7 w-32 rounded-md" />}
            </div>
            {description && <Bone className="mt-2.5 h-3.5 w-96 max-w-full bg-surface-2" />}
        </div>
    );
}

export function CardSkeleton({ className = "", header = true, children }: { className?: string; header?: boolean; children?: React.ReactNode }) {
    return (
        <div className={`overflow-hidden rounded-lg border border-line bg-surface ${className}`}>
            {header && (
                <div className="flex min-h-10 items-center border-b border-line px-4">
                    <Bone className="h-3.5 w-28" />
                </div>
            )}
            {children}
        </div>
    );
}

export function FieldSkeleton({ label = "w-24", tall = false }: { label?: string; tall?: boolean }) {
    return (
        <div>
            <Bone className={`mb-2 h-3 ${label}`} />
            <div className={`rounded-md border border-line bg-surface-2 ${tall ? "h-24" : "h-9"}`} />
        </div>
    );
}

export function FormSkeleton({ fields = 3, button = "w-32" }: { fields?: number; button?: string }) {
    return (
        <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: fields }, (_, index) => (
                <FieldSkeleton key={index} label={index % 2 ? "w-20" : "w-28"} />
            ))}
            <Bone className={`h-8 rounded-md ${button}`} />
        </div>
    );
}

const CELL_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-2/5"];

/** `columns` recebe as classes de cada coluna, ex.: "hidden md:table-cell" para seguir a responsividade da tabela real. */
export function TableSkeleton({ columns, rows = 8, checkbox = false }: { columns: string[]; rows?: number; checkbox?: boolean }) {
    return (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-line">
                        {checkbox && (
                            <th className="w-10 px-3 py-3">
                                <Bone className="size-4" />
                            </th>
                        )}
                        {columns.map((column, index) => (
                            <th key={index} className={`px-4 py-3 ${column}`}>
                                <Bone className="h-3 w-16" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {Array.from({ length: rows }, (_, row) => (
                        <tr key={row}>
                            {checkbox && (
                                <td className="px-3 py-3.5">
                                    <Bone className="size-4 bg-surface-2" />
                                </td>
                            )}
                            {columns.map((column, index) => (
                                <td key={index} className={`px-4 py-3.5 ${column}`}>
                                    <Bone className={`h-3.5 ${index === 0 ? "w-48 max-w-full" : CELL_WIDTHS[(row + index) % CELL_WIDTHS.length]} ${index ? "bg-surface-2" : ""}`} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Coluna lateral com o card de ação (Publicar/Salvar) usada nos editores. */
export function SidebarActionsSkeleton({ cards = 1 }: { cards?: number }) {
    return (
        <div className="flex flex-col gap-4">
            <CardSkeleton>
                <div className="flex flex-col gap-3 p-4">
                    <Bone className="h-3.5 w-3/4 bg-surface-2" />
                    <Bone className="h-3.5 w-1/2 bg-surface-2" />
                </div>
                <div className="flex justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-3">
                    <Bone className="h-8 w-20 rounded-md" />
                    <Bone className="h-8 w-24 rounded-md" />
                </div>
            </CardSkeleton>
            {Array.from({ length: cards - 1 }, (_, index) => (
                <CardSkeleton key={index}>
                    <div className="p-4">
                        <div className="h-9 rounded-md border border-line bg-surface-2" />
                    </div>
                </CardSkeleton>
            ))}
        </div>
    );
}
