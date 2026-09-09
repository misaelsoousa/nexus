import Link from "next/link";
import { DashboardIcon, MediaIcon, SettingsIcon, UserIcon } from "./Icons";
import { getTypePosts } from "@/lib/api";
import { PostType } from "@/types/PostType";

export default async function Sidebar() {
    let postTypes: PostType[] = [];

    try {
        postTypes = await getTypePosts({next: {revalidate: 60}});
    } catch {
        postTypes = [];
    }

    return (
        <aside className="w-[320px] h-screen bg-gray p-6">
            <ul className="flex flex-col gap-1">
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2">
                    <DashboardIcon/>
                    Dashboard
                </li>
                <li >
                <Link href={'/posts'} className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2">
                    <UserIcon/>
                    Posts
                </Link>
                {postTypes.length > 0 && (
                    <ul className="flex flex-col gap-1 ml-4 pl-3 border-l border-white/10">
                        {postTypes.map((postType) => (
                            <li key={postType.id}>
                                <Link
                                    href={`/posts?type=${postType.name}`}
                                    className="flex items-center cursor-pointer hover:gap-3 transition-all duration-100 text-sm text-white/70 hover:text-white hover:bg-white/2 rounded-lg p-2"
                                >
                                    {postType.displayName}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2">
                    <MediaIcon/>
                    Media
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2">
                    <UserIcon/>
                    Users
                </li>
                 <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2">
                    <SettingsIcon/>
                    Settings
                </li>
            </ul>
        </aside>
    );
}