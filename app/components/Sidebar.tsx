import { DashboardIcon, MediaIcon, SettingsIcon, UserIcon } from "./Icons";

export default function Sidebar() {
    return (
        <aside className="w-[320px] h-screen bg-gray     p-6">
            <ul className="flex flex-col gap-1">
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2 ">
                    <DashboardIcon/>
                    Dashboard
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2 ">
                    <UserIcon/>
                    Posts
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2 ">
                    <MediaIcon/>
                    Media
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2 ">
                    <UserIcon/>
                    Users
                </li>
                 <li className="flex items-center gap-2 cursor-pointer hover:gap-3 transition-all duration-100 font-semibold hover:bg-white/2 rounded-lg p-2 ">
                    <SettingsIcon/>
                    Settings
                </li>
            </ul>
        </aside>
    );
}