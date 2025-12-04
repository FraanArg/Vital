import { Clock, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimePickerProps {
    value: string; // Format "HH:mm"
    onChange: (value: string) => void;
    className?: string;
}

export default function TimePicker({ value, onChange, className = "" }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse current value
    const [hours, minutes] = value.split(':').map(Number);

    // Generate options
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals for easier selection

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
        let newH = hours;
        let newM = minutes;

        if (type === 'hour') newH = val;
        if (type === 'minute') newM = val;

        onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all w-full group ${isOpen ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20" : "bg-secondary/50 hover:bg-secondary text-foreground"}`}
            >
                <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${isOpen ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                    <span className="font-medium text-lg">{value}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-primary-foreground" : "text-muted-foreground"}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border border-border/50 rounded-2xl shadow-xl z-50 flex gap-2 h-[200px]"
                    >
                        {/* Hours Column */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar snap-y snap-mandatory">
                            <div className="text-xs font-medium text-muted-foreground text-center py-1 sticky top-0 bg-card z-10">Hr</div>
                            {hourOptions.map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => handleTimeChange('hour', h)}
                                    className={`p-2 rounded-lg text-sm font-medium transition-colors snap-start ${h === hours ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                                >
                                    {h.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="w-[1px] bg-border/50 my-2" />

                        {/* Minutes Column */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar snap-y snap-mandatory">
                            <div className="text-xs font-medium text-muted-foreground text-center py-1 sticky top-0 bg-card z-10">Min</div>
                            {minuteOptions.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleTimeChange('minute', m)}
                                    className={`p-2 rounded-lg text-sm font-medium transition-colors snap-start ${m === minutes ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
