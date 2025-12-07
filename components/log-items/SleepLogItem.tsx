import { Doc } from "../../convex/_generated/dataModel";

interface SleepLogItemProps {
    log: Doc<"logs">;
}

export default function SleepLogItem({ log }: SleepLogItemProps) {
    return (
        <div className="flex flex-col">
            <span className="font-semibold text-sm">Sleep: {log.sleep}h</span>
            {log.sleep_start && log.sleep_end && (
                <span className="text-xs text-muted-foreground">{log.sleep_start} - {log.sleep_end}</span>
            )}
        </div>
    );
}
