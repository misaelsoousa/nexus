import type { ButtonProps } from "@/types/UI";

export default function Button({text } : ButtonProps) {
    return (
        <button className="bg-surface text-foreground w-full max-w-48 mx-auto flex justify-center rounded-sm py-1 cursor-pointer hover:bg-red-500 border border-foreground/10 font-bold transition duration-150">
            {text}
        </button>
    );
}