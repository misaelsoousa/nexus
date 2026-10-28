import { Bone, HeaderSkeleton, SkeletonPage, TableSkeleton } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <Bone className="mb-2 h-3 w-20 bg-surface-2" />
            <HeaderSkeleton action />
            <div className="mb-5 flex gap-4 border-b border-line pb-2.5">
                <Bone className="h-3.5 w-16" />
                <Bone className="h-3.5 w-36 bg-surface-2" />
            </div>
            <TableSkeleton columns={["", "hidden md:table-cell", "hidden xl:table-cell", "hidden sm:table-cell"]} rows={6} checkbox />
        </SkeletonPage>
    );
}
