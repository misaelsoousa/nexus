import { CardSkeleton, FormSkeleton, HeaderSkeleton, SkeletonPage, TableSkeleton } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action />
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <CardSkeleton className="h-fit">
                    <FormSkeleton fields={4} />
                </CardSkeleton>
                <TableSkeleton columns={["", "", "hidden md:table-cell"]} rows={6} />
            </div>
        </SkeletonPage>
    );
}
