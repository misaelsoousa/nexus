import { Bone, HeaderSkeleton, SkeletonPage, TableSkeleton } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action />
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Bone className="h-3.5 w-16" />
                    <Bone className="h-3.5 w-24 bg-surface-2" />
                    <Bone className="h-3.5 w-20 bg-surface-2" />
                </div>
                <div className="flex gap-2">
                    <div className="h-8 flex-1 rounded-md border border-line bg-surface md:w-56" />
                    <Bone className="h-8 w-24 rounded-md" />
                </div>
            </div>
            <TableSkeleton checkbox columns={["", "hidden md:table-cell", "hidden sm:table-cell", "hidden lg:table-cell"]} rows={10} />
        </SkeletonPage>
    );
}
