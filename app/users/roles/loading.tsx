import { Bone, CardSkeleton, FieldSkeleton, HeaderSkeleton, SkeletonPage, TableSkeleton } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action />
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <CardSkeleton className="h-fit">
                    <div className="flex flex-col gap-4 p-4">
                        <FieldSkeleton />
                        {[4, 3, 4].map((count, group) => (
                            <div key={group} className="flex flex-col gap-2">
                                <Bone className="h-3 w-20" />
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {Array.from({ length: count }, (_, item) => (
                                        <div key={item} className="flex items-center gap-1.5">
                                            <Bone className="size-4 bg-surface-2" />
                                            <Bone className="h-3 w-12 bg-surface-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Bone className="h-8 w-32 rounded-md" />
                    </div>
                </CardSkeleton>
                <TableSkeleton columns={["", "[&>div]:ml-auto"]} rows={4} />
            </div>
        </SkeletonPage>
    );
}
