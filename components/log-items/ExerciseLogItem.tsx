import { Dumbbell, Timer, Footprints, Trophy } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { ICON_LIBRARY } from "../../lib/icon-library";
import { DEFAULT_SPORTS } from "../../lib/constants";

interface ExerciseLogItemProps {
    log: Doc<"logs">;
    iconMappings?: Doc<"icon_mappings">[];
}

export default function ExerciseLogItem({ log }: Omit<ExerciseLogItemProps, "iconMappings">) {
    if (!log.exercise) return null;

    const typeName = log.exercise.type.charAt(0).toUpperCase() + log.exercise.type.slice(1);

    const getEndTime = (start: string, duration: number) => {
        const [h, m] = start.split(':').map(Number);
        const totalMinutes = h * 60 + m + duration;
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    const timeDisplay = log.exercise.time
        ? `${log.exercise.time} - ${getEndTime(log.exercise.time, log.exercise.duration)}`
        : `${log.exercise.duration}m`;

    if (log.exercise.type === "gym" && log.exercise.workout) {
        const exerciseCount = log.exercise.workout.length;
        const exerciseNames = log.exercise.workout.map(w => w.name).join(", ");
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                    {typeName} <span className="text-[10px] text-muted font-normal">{timeDisplay}</span>
                </span>
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {exerciseCount} exercises: {exerciseNames.substring(0, 25)}{exerciseNames.length > 25 ? '...' : ''}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <span className="font-semibold text-xs flex items-center gap-1.5">
                {typeName} <span className="text-[10px] text-muted font-normal">{timeDisplay}</span>
            </span>
            {log.exercise.distance && (
                <span className="text-[10px] text-muted-foreground">{log.exercise.distance} km</span>
            )}
        </div>
    );
}

export function getExerciseIcon(log: Doc<"logs">, iconMappings?: Doc<"icon_mappings">[]) {
    if (!log.exercise) return Dumbbell;

    const defaultIcons: Record<string, React.ElementType> = {
        gym: Dumbbell,
        run: Timer,
        walk: Footprints,
    };

    DEFAULT_SPORTS.forEach(sport => {
        defaultIcons[sport.id] = sport.icon;
    });

    const customMapping = iconMappings?.find(m => m.type === "sport" && m.key === log.exercise!.type);
    let Icon = defaultIcons[log.exercise.type] || Trophy;

    if (customMapping && ICON_LIBRARY[customMapping.icon]) {
        Icon = ICON_LIBRARY[customMapping.icon];
    }
    return Icon;
}
