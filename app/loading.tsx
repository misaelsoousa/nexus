import { Bone, CardSkeleton, HeaderSkeleton, SkeletonPage } from "./components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton />
            <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                    <CardSkeleton>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4">
                            {[0, 1, 2, 3].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Bone className="size-4" />
                                    <Bone className="h-3.5 w-24 bg-surface-2" />
                                </div>
                            ))}
                        </div>
                    </CardSkeleton>
                    <CardSkeleton>
                        <div className="flex flex-col gap-5 p-4">
                            {[0, 1].map((section) => (
                                <div key={section} className="flex flex-col gap-2.5">
                                    <Bone className="h-3.5 w-40" />
                                    {[0, 1, 2, 3].map((row) => (
                                        <div key={row} className="grid grid-cols-[130px_1fr] gap-3">
                                            <Bone className="h-3.5 w-24 bg-surface-2" />
                                            <Bone className={`h-3.5 bg-surface-2 ${row % 2 ? "w-1/2" : "w-3/4"}`} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </CardSkeleton>
                </div>
                <div className="flex flex-col gap-5">
                    <CardSkeleton>
                        <div className="divide-y divide-line">
                            {[0, 1, 2].map((row) => (
                                <div key={row} className="flex items-center gap-3 px-4 py-2.5">
                                    <Bone className="h-3.5 w-24 shrink-0" />
                                    <div className="flex-1">
                                        <Bone className={`h-3.5 bg-surface-2 ${row % 2 ? "w-1/2" : "w-3/4"}`} />
                                        <Bone className="mt-1.5 h-3 w-16 bg-surface-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardSkeleton>
                    <CardSkeleton>
                        <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
                            {Array.from({ length: 12 }, (_, item) => (
                                <div key={item} className="aspect-square rounded-md border border-line bg-surface-2" />
                            ))}
                        </div>
                    </CardSkeleton>
                </div>
            </div>
        </SkeletonPage>
    );
}
