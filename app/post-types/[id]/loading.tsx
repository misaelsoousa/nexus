import { Bone, CardSkeleton, FieldSkeleton, HeaderSkeleton, SidebarActionsSkeleton, SkeletonPage } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action />
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="flex min-w-0 flex-col gap-5">
                    <CardSkeleton>
                        <div className="grid gap-4 p-4 sm:grid-cols-2">
                            <FieldSkeleton />
                            <FieldSkeleton label="w-20" />
                        </div>
                    </CardSkeleton>
                    <CardSkeleton>
                        <div className="divide-y divide-line">
                            {[0, 1, 2].map((row) => (
                                <div key={row} className="flex gap-3 p-4">
                                    <div className="flex flex-col gap-1.5 pt-6">
                                        <Bone className="size-6 bg-surface-2" />
                                        <Bone className="size-6 bg-surface-2" />
                                    </div>
                                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_170px]">
                                        <FieldSkeleton label="w-14" />
                                        <FieldSkeleton label="w-12" />
                                        <FieldSkeleton label="w-10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardSkeleton>
                </div>
                <SidebarActionsSkeleton />
            </div>
        </SkeletonPage>
    );
}
