import { Bone, CardSkeleton, HeaderSkeleton, SidebarActionsSkeleton, SkeletonPage } from "../../components/skeletons";

export default function EditorSkeleton() {
    return (
        <SkeletonPage>
            <HeaderSkeleton />
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="flex min-w-0 flex-col gap-5">
                    <div>
                        <div className="h-12 rounded-md border border-line bg-surface" />
                        <div className="mt-3 flex items-center gap-2">
                            <Bone className="h-3 w-10" />
                            <Bone className="h-3 w-48 bg-surface-2" />
                        </div>
                    </div>
                    <CardSkeleton>
                        <div className="divide-y divide-line">
                            {[false, true, false, false].map((tall, index) => (
                                <div key={index} className="grid gap-2 p-4 md:grid-cols-[180px_1fr] md:gap-5">
                                    <Bone className="h-3.5 w-24 md:mt-2.5" />
                                    <div className={`rounded-md border border-line bg-surface-2 ${tall ? "h-28" : "h-9"}`} />
                                </div>
                            ))}
                        </div>
                    </CardSkeleton>
                </div>
                <SidebarActionsSkeleton cards={3} />
            </div>
        </SkeletonPage>
    );
}
