import { Doc } from "../../convex/_generated/dataModel";

interface SleepLogItemProps {
    log: Doc<"logs">;
}

export default function SleepLogItem({ log }: SleepLogItemProps) {
    return <span>Sleep: {log.sleep}h</span>;
}
