import { Bone, HeaderSkeleton, SkeletonPage } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton action />
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-8">
                    <Bone className="size-9 rounded-md" />
                    <Bone className="h-3.5 w-44" />
                    <Bone className="h-3 w-80 max-w-full bg-surface-2" />
                    <Bone className="h-8 w-36 rounded-md" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-max gap-0.5 rounded-md border border-line bg-surface-2 p-0.5">
                        {["w-16", "w-20", "w-16", "w-24"].map((width, index) => (
                            <div key={index} className={`flex h-7 items-center rounded px-3 ${index === 0 ? "bg-surface" : ""}`}>
                                <Bone className={`h-3 ${width}`} />
                            </div>
                        ))}
                    </div>
                    <div className="h-9 rounded-md border border-line bg-surface sm:w-64" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }, (_, item) => (
                        <div key={item}>
                            <div className="aspect-square rounded-md border border-line bg-surface-2" />
                            <Bone className="mt-2 h-3.5 w-3/4" />
                            <Bone className="mt-1.5 h-3 w-12 bg-surface-2" />
                        </div>
                    ))}
                </div>
            </div>
        </SkeletonPage>
    );
}
