type IconProps = { className?: string };

function Icon({ className = "size-5", children }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function DashboardIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3.5" y="3.5" width="7" height="9" rx="2" />
            <rect x="13.5" y="3.5" width="7" height="5" rx="2" />
            <rect x="13.5" y="11.5" width="7" height="9" rx="2" />
            <rect x="3.5" y="15.5" width="7" height="5" rx="2" />
        </Icon>
    );
}

export function PostsIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" />
            <path d="M14 3.5V8h4.5" />
            <path d="M9 12.5h6M9 16h4" />
        </Icon>
    );
}

export function LayersIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z" />
            <path d="m3.5 12 8.5 4.5 8.5-4.5" />
            <path d="m3.5 16 8.5 4.5 8.5-4.5" />
        </Icon>
    );
}

export function InboxIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M3.5 13.5h4.25l1.5 2.5h5.5l1.5-2.5h4.25" />
            <path d="M6.2 5.5h11.6a1.5 1.5 0 0 1 1.4 1l1.3 6.1v5.4a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5v-5.4l1.3-6.1a1.5 1.5 0 0 1 1.4-1z" />
        </Icon>
    );
}

export function MediaIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
            <circle cx="9" cy="10" r="1.75" />
            <path d="m20.5 15.5-4.2-4.2a1.5 1.5 0 0 0-2.1 0L6.5 19.5" />
        </Icon>
    );
}

export function SettingsIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
            <circle cx="15" cy="7" r="2" />
            <circle cx="9" cy="17" r="2" />
        </Icon>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 5v14M5 12h14" />
        </Icon>
    );
}

export function SunIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
        </Icon>
    );
}

export function MoonIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5" />
        </Icon>
    );
}

export function MonitorIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="12.5" rx="2" />
            <path d="M8.5 20h7M12 16.5V20" />
        </Icon>
    );
}

export function SidebarLayoutIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M9 4v16" />
        </Icon>
    );
}

export function BottomBarLayoutIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M3 15h18" />
        </Icon>
    );
}

export function CollapseIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M9 4v16M15.5 10 13.5 12l2 2" />
        </Icon>
    );
}

export function ChevronLeftIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m14.5 6-6 6 6 6" />
        </Icon>
    );
}

export function ChevronRightIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m9.5 6 6 6-6 6" />
        </Icon>
    );
}

export function ArrowUpIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 19V5M6 11l6-6 6 6" />
        </Icon>
    );
}

export function ArrowDownIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 5v14M6 13l6 6 6-6" />
        </Icon>
    );
}

export function ArrowUpRightIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M7 17 17 7M8 7h9v9" />
        </Icon>
    );
}

export function TrashIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.8l1-12M9 7V4.5h6V7" />
        </Icon>
    );
}

export function UploadIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 15.5V4M7 8.5l5-4.5 5 4.5" />
            <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </Icon>
    );
}

export function FileIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" />
            <path d="M14 3.5V8h4.5" />
        </Icon>
    );
}

export function VideoIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="3" y="6" width="13" height="12" rx="2.5" />
            <path d="m16 10.5 5-3v9l-5-3" />
        </Icon>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </Icon>
    );
}

export function CloseIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M6 6l12 12M18 6 6 18" />
        </Icon>
    );
}

export function CopyIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
            <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
        </Icon>
    );
}

export function AlertIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5h.01" />
        </Icon>
    );
}

export function MenuIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </Icon>
    );
}

export function SearchIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
        </Icon>
    );
}

export function UserIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 20a7 7 0 0 1 14 0" />
        </Icon>
    );
}

export function LogoutIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16.5 5.5 12 10 7.5M5.5 12H15" />
        </Icon>
    );
}

export function EditIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
            <path d="m13.5 6.5 4 4" />
        </Icon>
    );
}

export function PageIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="4" y="3.5" width="16" height="17" rx="2" />
            <path d="M4 8.5h16M8 12.5h8M8 16h5" />
        </Icon>
    );
}

export function GlobeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5" />
        </Icon>
    );
}

export function EyeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </Icon>
    );
}

export function EyeOffIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.9 0 3.5-.6 4.9-1.5" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17" />
        </Icon>
    );
}

export function UsersIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
            <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.4c2.1.7 3.5 2.6 3.5 5.1" />
        </Icon>
    );
}

export function ShieldIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
            <path d="m9 12 2 2 4-4" />
        </Icon>
    );
}

export function LogoMark({ className = "size-9" }: IconProps) {
    return (
        // Mesmo desenho de public/icons/Logo.svg, mas com currentColor para funcionar na barra escura e no tema escuro.
        <svg viewBox="0 0 40 45" fill="currentColor" className={className} aria-hidden="true">
            <path d="M14.4526 2.19784C14.4526 0.660014 16.2372 -0.401456 17.9026 0.145739L38.3606 6.86792C39.3474 7.19218 39.9997 8.00875 39.9997 8.92004V33.3034L35.7249 36.8701V20.2584C35.7249 19.3621 35.0937 18.5558 34.1301 18.2212L14.4526 11.3894V2.19784Z" />
            <path
                d="M7.83691 14.6703C7.83694 13.1324 9.62144 12.0709 11.2869 12.6182L31.7449 19.3404C32.7317 19.6646 33.384 20.4812 33.384 21.3925V38.8479L29.1092 42.4146V32.7309C29.1092 31.8345 28.4779 31.0282 27.5144 30.6936L7.83691 23.8619V14.6703Z"
                opacity="0.88"
            />
            <path
                d="M0 35.6243C0 36.5329 0.648419 37.3476 1.63109 37.6738L23.0052 44.7681C24.6719 45.3213 26.4631 44.2597 26.4631 42.7186V34.2488C26.4631 33.3402 25.8147 32.5255 24.832 32.1993L3.45796 25.105C1.79129 24.5518 0 25.6134 0 27.1545V35.6243Z"
                opacity="0.76"
            />
        </svg>
    );
}

export function CodeIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5M13.5 5l-3 14" />
        </Icon>
    );
}

export function ClockIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </Icon>
    );
}
