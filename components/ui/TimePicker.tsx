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
            <button
                type="button"
                onClick={() => {
                    try {
                        if (inputRef.current) {
                            if ("showPicker" in HTMLInputElement.prototype) {
                                inputRef.current.showPicker();
                            } else {
                                inputRef.current.click();
                            }
                        }
                    } catch (e) {
                        console.error("TimePicker trigger failed", e);
                    }
                }}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-foreground font-medium text-lg group w-full"
            >
                <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>{value}</span>
            </button>
            <input
                ref={inputRef}
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                aria-label="Select time"
                tabIndex={-1}
            />
        </div>
    );
}
