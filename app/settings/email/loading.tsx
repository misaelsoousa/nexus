import { Bone, CardSkeleton, FormSkeleton, SidebarActionsSkeleton, SkeletonPage } from "../../components/skeletons";

export default function Loading() {
    return (
        <SkeletonPage>
            <Bone className="mb-5 h-3.5 w-full max-w-2xl bg-surface-2" />
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="flex flex-col gap-5">
                    <CardSkeleton>
                        <FormSkeleton fields={2} button="w-0" />
                    </CardSkeleton>
                    <CardSkeleton>
                        <FormSkeleton fields={2} button="w-0" />
                    </CardSkeleton>
                </div>
                <SidebarActionsSkeleton cards={2} />
            </div>
        </SkeletonPage>
    );
}
