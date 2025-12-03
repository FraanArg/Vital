

interface ChipOption {
    id: string;
    label: string;
    icon?: React.ReactNode | string;
}

interface ChipSelectorProps {
    options: ChipOption[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    className?: string;
}

export default function ChipSelector({ options, selectedId, onSelect, className = "" }: ChipSelectorProps) {
    return (
        <div className={`flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide ${className}`}>
            {options.map((option) => {
                const isSelected = selectedId === option.id;
                return (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all border ${isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        {option.icon && <span className="text-lg leading-none">{option.icon}</span>}
                        <span className="text-sm font-semibold">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
