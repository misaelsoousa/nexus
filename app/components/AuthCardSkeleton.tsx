import { Bone, FieldSkeleton, SkeletonPage } from "./skeletons";

export default function AuthCardSkeleton({ fields = 2 }: { fields?: number }) {
    return (
        <SkeletonPage>
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center justify-center gap-2.5">
                    <Bone className="size-9 rounded-lg" />
                    <Bone className="h-5 w-16" />
                </div>
                <div className="rounded-lg bg-surface p-6 shadow-float sm:p-7">
                    <Bone className="h-5 w-40" />
                    <Bone className="mt-2 mb-6 h-3.5 w-56 bg-surface-2" />
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: fields }, (_, index) => (
                            <FieldSkeleton key={index} label={index % 2 ? "w-12" : "w-14"} />
                        ))}
                        <Bone className="mt-1 h-9 w-full rounded-md" />
                    </div>
                </div>
                <Bone className="mx-auto mt-6 h-3.5 w-48 bg-surface-2" />
            </div>
        </SkeletonPage>
    );
}
