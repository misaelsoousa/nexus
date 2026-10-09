import { HeaderSkeleton, SkeletonPage, TableSkeleton } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action description />
            <TableSkeleton columns={["", "hidden sm:table-cell", "hidden md:table-cell", "[&>div]:ml-auto"]} rows={5} />
        </SkeletonPage>
    );
}
