import { Bone, CardSkeleton, HeaderSkeleton, SidebarActionsSkeleton, SkeletonPage } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <Bone className="mb-2 h-3 w-14 bg-surface-2" />
            <HeaderSkeleton />
            <div className="mb-5 flex gap-4 border-b border-line pb-2.5">
                <Bone className="h-3.5 w-16" />
                <Bone className="h-3.5 w-16 bg-surface-2" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <CardSkeleton>
                    <div className="divide-y divide-line">
                        <div className="bg-surface-2/60 px-4 py-2.5">
                            <Bone className="h-3 w-20" />
                        </div>
                        {[0, 1, 2, 3].map((row) => (
                            <div key={row} className="grid gap-2 px-4 py-4 md:grid-cols-[180px_1fr] md:gap-5">
                                <Bone className="h-3.5 w-24 md:mt-2.5" />
                                <div className={`rounded-md border border-line bg-surface-2 ${row === 1 ? "h-9 w-40" : row === 2 ? "h-24" : "h-9"}`} />
                            </div>
                        ))}
                    </div>
                </CardSkeleton>
                <SidebarActionsSkeleton />
            </div>
        </SkeletonPage>
    );
}
