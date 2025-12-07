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
    const duration = `${log.exercise.duration}m`;

    if (log.exercise.type === "gym" && log.exercise.workout) {
        const exerciseCount = log.exercise.workout.length;
        return <span>{typeName}: {exerciseCount} exercises ({duration})</span>;
    }

    if (log.exercise.distance) {
        return <span>{typeName}: {log.exercise.distance}km ({duration})</span>;
    }

    return <span>{typeName}: {duration}</span>;
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
