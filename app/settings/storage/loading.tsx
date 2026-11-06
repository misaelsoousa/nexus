import { Bone, CardSkeleton, SkeletonPage } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <Bone className="mb-5 h-3.5 w-full max-w-2xl bg-surface-2" />
            <div className="flex flex-col gap-5">
                <CardSkeleton>
                    <div className="flex items-center gap-6 p-4">
                        <div className="flex-1">
                            <Bone className="h-4 w-40" />
                            <Bone className="mt-2 h-3 w-64 max-w-full bg-surface-2" />
                        </div>
                        <Bone className="h-3 w-48 bg-surface-2" />
                    </div>
                </CardSkeleton>
                <CardSkeleton>
                    <div className="divide-y divide-line">
                        {[0, 1].map((row) => (
                            <div key={row} className="flex items-center gap-4 px-4 py-3.5">
                                <div className="flex-1">
                                    <Bone className="h-3.5 w-36" />
                                    <Bone className="mt-1.5 h-3 w-56 max-w-full bg-surface-2" />
                                </div>
                                <Bone className="h-3 w-16 bg-surface-2" />
                                <Bone className="h-3 w-20 bg-surface-2" />
                            </div>
                        ))}
                    </div>
                </CardSkeleton>
                <CardSkeleton>
                    <div className="flex flex-col gap-3 p-4">
                        <Bone className="h-3.5 w-full max-w-lg bg-surface-2" />
                        <Bone className="h-8 w-36 rounded-md" />
                    </div>
                </CardSkeleton>
            </div>
        </SkeletonPage>
    );
}
