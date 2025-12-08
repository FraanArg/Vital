"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
    Scale, Ruler, TrendingUp, TrendingDown, Minus, Plus,
    ChevronDown, ChevronUp, Calculator, Activity, Target
} from "lucide-react";
import { format } from "date-fns";

export default function BodyCompositionPage() {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        weight: "",
        bodyFat: "",
        waist: "",
        chest: "",
        arms: "",
        thighs: "",
        neck: "",
        notes: "",
    });

    const measurements = useQuery(api.body.getMeasurements, { days: 90 });
    const bodyStats = useQuery(api.body.getBodyStats);
    const progress = useQuery(api.body.getProgress);
    const addMeasurement = useMutation(api.body.addMeasurement);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addMeasurement({
            date: new Date().toISOString().split('T')[0],
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
            waist: formData.waist ? parseFloat(formData.waist) : undefined,
            chest: formData.chest ? parseFloat(formData.chest) : undefined,
            arms: formData.arms ? parseFloat(formData.arms) : undefined,
            thighs: formData.thighs ? parseFloat(formData.thighs) : undefined,
            neck: formData.neck ? parseFloat(formData.neck) : undefined,
            notes: formData.notes || undefined,
        });
        setFormData({ weight: "", bodyFat: "", waist: "", chest: "", arms: "", thighs: "", neck: "", notes: "" });
        setShowForm(false);
    };

    const getBmiColor = (bmi: number) => {
        if (bmi < 18.5) return "text-yellow-500";
        if (bmi < 25) return "text-green-500";
        if (bmi < 30) return "text-orange-500";
        return "text-red-500";
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                            <Scale className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Body Composition</h1>
                            <p className="text-sm text-muted-foreground">Track your progress over time</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="p-3 bg-primary text-primary-foreground rounded-full hover:scale-105 active:scale-95 transition-transform"
                    >
                        {showForm ? <ChevronUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>

                {/* Add Measurement Form */}
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border/50 p-5"
                        onSubmit={handleSubmit}
                    >
                        <h3 className="font-semibold mb-4">Log Measurements</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs text-muted-foreground">Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="75.5"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Body Fat (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.bodyFat}
                                    onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="18.5"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Waist (cm)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.waist}
                                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="82"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Chest (cm)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.chest}
                                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Arms (cm)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.arms}
                                    onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="35"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Thighs (cm)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.thighs}
                                    onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="55"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Neck (cm)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.neck}
                                    onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="38"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Notes</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="Morning, fasted"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
                        >
                            Save Measurement
                        </button>
                    </motion.form>
                )}

                {/* Stats Cards */}
                {bodyStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card rounded-xl border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">BMI</span>
                            </div>
                            <div className={`text-2xl font-bold ${getBmiColor(bodyStats.bmi)}`}>
                                {bodyStats.bmi}
                            </div>
                            <div className="text-xs text-muted-foreground">{bodyStats.bmiCategory}</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card rounded-xl border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-orange-500" />
                                <span className="text-xs text-muted-foreground">TDEE</span>
                            </div>
                            <div className="text-2xl font-bold">{bodyStats.tdee}</div>
                            <div className="text-xs text-muted-foreground">cal/day</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card rounded-xl border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Scale className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-muted-foreground">Weight</span>
                            </div>
                            <div className="text-2xl font-bold">{bodyStats.weight}</div>
                            <div className="text-xs text-muted-foreground">kg</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-card rounded-xl border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {bodyStats.weightChange !== null && bodyStats.weightChange !== 0 ? (
                                    bodyStats.weightChange > 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-blue-500" />
                                    )
                                ) : (
                                    <Minus className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="text-xs text-muted-foreground">30d Change</span>
                            </div>
                            <div className={`text-2xl font-bold ${bodyStats.weightChange !== null && bodyStats.weightChange > 0
                                    ? "text-green-500"
                                    : bodyStats.weightChange !== null && bodyStats.weightChange < 0
                                        ? "text-blue-500"
                                        : ""
                                }`}>
                                {bodyStats.weightChange !== null
                                    ? `${bodyStats.weightChange > 0 ? "+" : ""}${bodyStats.weightChange}`
                                    : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">kg</div>
                        </motion.div>
                    </div>
                )}

                {/* Progress Comparison */}
                {progress && progress.changes.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold">Progress</h3>
                            <span className="text-xs text-muted-foreground ml-auto">
                                {progress.daysBetween} days tracked
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {progress.changes.map((change) => (
                                <div
                                    key={change.metric}
                                    className="bg-background/50 rounded-xl p-3 border border-border/30"
                                >
                                    <div className="text-xs text-muted-foreground mb-1">{change.metric}</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-lg font-bold">
                                            {change.latest}{change.unit}
                                        </span>
                                        {change.change !== null && change.change !== 0 && (
                                            <span className={`text-xs ${change.change > 0 ? "text-green-500" : "text-blue-500"}`}>
                                                {change.change > 0 ? "+" : ""}{change.change}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        from {change.first}{change.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Measurement History */}
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Ruler className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">History</h3>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {measurements?.length || 0} records
                        </span>
                    </div>
                    {measurements && measurements.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {measurements.map((m) => (
                                <div
                                    key={m._id}
                                    className="flex items-center gap-4 p-3 bg-background/50 rounded-lg border border-border/30"
                                >
                                    <div className="text-sm font-medium min-w-[80px]">
                                        {format(new Date(m.date), "MMM d")}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {m.weight && <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded">{m.weight}kg</span>}
                                        {m.bodyFat && <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded">{m.bodyFat}%</span>}
                                        {m.waist && <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">W:{m.waist}</span>}
                                        {m.chest && <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">C:{m.chest}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No measurements yet. Click + to add your first!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
