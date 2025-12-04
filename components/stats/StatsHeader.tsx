"use client";

import { SegmentedControl } from "../ui/SegmentedControl";

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

            <SegmentedControl
                options={["week", "month", "year"]}
                value={range}
                onChange={setRange}
            />
        </div>
    );
}
