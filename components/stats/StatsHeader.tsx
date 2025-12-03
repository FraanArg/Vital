"use client";



interface StatsHeaderProps {
    range: "week" | "month" | "year";
    setRange: (range: "week" | "month" | "year") => void;
}

export default function StatsHeader({ range, setRange }: StatsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Summary</h1>
                <p className="text-muted-foreground mt-1">Your activity and health trends.</p>
            </div>

            <div className="flex bg-secondary/50 p-1 rounded-xl">
                {(["week", "month", "year"] as const).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
}
