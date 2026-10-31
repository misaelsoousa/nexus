import { Bone, CardSkeleton, SkeletonPage } from "../components/skeletons";

function DefinitionsSkeleton({ rows }: { rows: number }) {
    return (
        <div className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-[auto_1fr]">
            {Array.from({ length: rows }, (_, row) => (
                <div key={row} className="contents">
                    <Bone className="h-3.5 w-28 bg-surface-2" />
                    <Bone className={`h-3.5 max-w-full ${row % 2 ? "w-40" : "w-56"}`} />
                </div>
            ))}
        </div>
    );
}

export default function Loading() {
    return (
        <SkeletonPage>
            <div className="flex flex-col gap-5">
                <CardSkeleton>
                    <DefinitionsSkeleton rows={4} />
                </CardSkeleton>
                <CardSkeleton>
                    <div className="flex flex-col gap-4 p-4">
                        <Bone className="h-3.5 w-full max-w-xl bg-surface-2" />
                        <div className="divide-y divide-line rounded-md border border-line">
                            {[0, 1].map((row) => (
                                <div key={row} className="flex items-center gap-3 px-3 py-3">
                                    <Bone className="h-3.5 w-24" />
                                    <Bone className="h-3 w-10 bg-surface-2" />
                                </div>
                            ))}
                        </div>
                        <Bone className="h-9 w-80 max-w-full rounded-md bg-surface-2" />
                    </div>
                </CardSkeleton>
                <CardSkeleton>
                    <DefinitionsSkeleton rows={2} />
                </CardSkeleton>
            </div>
        </SkeletonPage>
    );
}
