import { HeaderSkeleton, SkeletonPage, TableSkeleton } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action description />
            <TableSkeleton columns={["", "hidden sm:table-cell", "[&>div]:ml-auto", "hidden md:table-cell", "hidden lg:table-cell"]} rows={4} />
        </SkeletonPage>
    );
}
