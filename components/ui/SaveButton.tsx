import { Loader2 } from "lucide-react";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isSaving?: boolean;
    label?: string;
}

export default function SaveButton({ isSaving, label = "Save", className, ...props }: SaveButtonProps) {
    return (
        <button
            disabled={isSaving || props.disabled}
            className={`w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : label}
        </button>
    );
}
