import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";

export default function ExerciseHistory({ exerciseName }: { exerciseName: string }) {
    const history = useQuery(api.logs.getExerciseHistory, { exerciseName, limit: 3 });

    if (!history || history.length === 0) return null;

    return (
        <div className="mt-2 p-3 bg-secondary/30 rounded-xl text-xs space-y-2">
            <div className="font-medium text-muted-foreground">Last performed:</div>
            {history.map((entry, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-border/50 last:border-none pb-2 last:pb-0">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{format(new Date(entry.date), "MMM d")}</span>
                        <div className="flex gap-2">
                            {entry.sets.map((set, j) => (
                                <span key={j} className="bg-background/50 px-1.5 py-0.5 rounded">
                                    {set.weight}kg x {set.reps}
                                </span>
                            ))}
                        </div>
                    </div>
                    {entry.notes && (
                        <p className="text-muted-foreground italic pl-2 border-l-2 border-primary/20">
                            &quot;{entry.notes}&quot;
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
