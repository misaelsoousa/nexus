type ButtonProps = {
    text: string;
};

export default function Button({text } : ButtonProps) {
    return (
        <button className="bg-white text-black w-full max-w-48 mx-auto flex justify-center rounded-sm py-1 cursor-pointer hover:bg-red-500 border border-white/10 font-bold transition duration-150">
            {text}
        </button>
    );
}