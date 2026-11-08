import { Bone, CardSkeleton, HeaderSkeleton, SkeletonPage } from "../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <HeaderSkeleton description />
            <div className="flex flex-col gap-5">
                <CardSkeleton>
                    <div className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-[auto_1fr]">
                        <Bone className="h-3.5 w-20 bg-surface-2" />
                        <Bone className="h-3.5 w-64 max-w-full" />
                        <Bone className="h-3.5 w-24 bg-surface-2" />
                        <Bone className="h-3.5 w-72 max-w-full" />
                    </div>
                </CardSkeleton>
                <CardSkeleton>
                    <div className="flex flex-wrap gap-2 p-4">
                        {["w-28", "w-24", "w-32"].map((width, index) => (
                            <Bone key={index} className={`h-7 rounded-md ${width} ${index ? "bg-surface-2" : ""}`} />
                        ))}
                    </div>
                </CardSkeleton>
                {[0, 1].map((route) => (
                    <CardSkeleton key={route} header={false}>
                        <div className="flex min-h-10 items-center gap-2 border-b border-line px-4">
                            <Bone className="h-5 w-10" />
                            <Bone className="h-3.5 w-56 bg-surface-2" />
                        </div>
                        <div className="flex flex-col gap-4 p-4">
                            <div className="h-24 rounded-md border border-line bg-surface-2" />
                            <div className="h-56 rounded-md border border-line bg-surface-2" />
                            <div className="h-8 rounded-md border border-line" />
                        </div>
                    </CardSkeleton>
                ))}
            </div>
        </SkeletonPage>
    );
}
