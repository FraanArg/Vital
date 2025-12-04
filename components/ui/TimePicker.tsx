import { Clock } from "lucide-react";
import { useRef } from "react";

interface TimePickerProps {
    value: string; // Format "HH:mm"
    onChange: (value: string) => void;
    className?: string;
}

export default function TimePicker({ value, onChange, className = "" }: TimePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`relative ${className}`}>
            <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium text-lg group">
                <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>{value}</span>
                <input
                    ref={inputRef}
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    aria-label="Select time"
                />
            </div>
        </div>
    );
}
