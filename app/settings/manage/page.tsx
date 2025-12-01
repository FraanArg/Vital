"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ArrowLeft, Plus, Trash2, Settings, Utensils } from "lucide-react";
import Link from "next/link";
import { ICON_LIBRARY } from "../../../lib/icon-library";
import IconPicker from "../../../components/IconPicker";
import { useToast } from "../../../components/ui/ToastContext";
import { AnimatePresence, motion } from "framer-motion";

export default function ManagePage() {
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newSportName, setNewSportName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("Trophy");
    const [showIconPicker, setShowIconPicker] = useState(false);

    const [isAddingFood, setIsAddingFood] = useState(false);
    const [newFoodName, setNewFoodName] = useState("");

    const sports = useQuery(api.sports.getSports);
    const createSport = useMutation(api.sports.createSport);
    const deleteSport = useMutation(api.sports.deleteSport);

    const foods = useQuery(api.foodItems.list);
    const createFood = useMutation(api.foodItems.create);
    const deleteFood = useMutation(api.foodItems.remove);

    const handleCreate = async () => {
        if (newSportName.trim()) {
            await createSport({ name: newSportName, icon: selectedIcon });
            toast("Sport added successfully", "success");
            setNewSportName("");
            setSelectedIcon("Trophy");
            setIsAdding(false);
        }
    };

    const handleCreateFood = async () => {
        if (newFoodName.trim()) {
            await createFood({ name: newFoodName });
            toast("Food added successfully", "success");
            setNewFoodName("");
            setIsAddingFood(false);
        }
    };

    const handleDelete = async (id: Id<"sports">) => {
        if (confirm("Are you sure you want to delete this sport?")) {
            await deleteSport({ id });
            toast("Sport deleted", "info");
        }
    };

    const handleDeleteFood = async (id: Id<"foodItems">) => {
        if (confirm("Are you sure you want to delete this food item?")) {
            await deleteFood({ id });
            toast("Food deleted", "info");
        }
    };

    const SelectedIconComponent = ICON_LIBRARY[selectedIcon] || ICON_LIBRARY["Trophy"];

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/settings" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg">Manage Items</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-8">
                {/* Sports Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Sports</h2>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-sm text-primary font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add New
                        </button>
                    </div>

                    {isAdding && (
                        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <input
                                    type="text"
                                    value={newSportName}
                                    onChange={(e) => setNewSportName(e.target.value)}
                                    placeholder="e.g. Squash"
                                    className="w-full p-3 rounded-xl bg-background border border-border/50 focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Icon</label>
                                <button
                                    onClick={() => setShowIconPicker(true)}
                                    className="w-full p-3 rounded-xl bg-background border border-border/50 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                                >
                                    <SelectedIconComponent className="w-6 h-6 text-primary" />
                                    <span className="flex-1 text-left">{selectedIcon}</span>
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 p-3 rounded-xl font-medium hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newSportName}
                                    className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg disabled:opacity-50"
                                >
                                    Save Sport
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <AnimatePresence mode="popLayout">
                            {sports?.map((sport) => {
                                const Icon = ICON_LIBRARY[sport.icon] || ICON_LIBRARY["Trophy"];
                                return (
                                    <motion.div
                                        key={sport._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background text-foreground">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">{sport.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(sport._id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {sports?.length === 0 && !isAdding && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No custom sports yet. Add one to get started!
                            </div>
                        )}
                    </div>
                </section>

                {/* Foods Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Foods</h2>
                        <button
                            onClick={() => setIsAddingFood(true)}
                            className="text-sm text-primary font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add New
                        </button>
                    </div>

                    {isAddingFood && (
                        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <input
                                    type="text"
                                    value={newFoodName}
                                    onChange={(e) => setNewFoodName(e.target.value)}
                                    placeholder="e.g. Banana"
                                    className="w-full p-3 rounded-xl bg-background border border-border/50 focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsAddingFood(false)}
                                    className="flex-1 p-3 rounded-xl font-medium hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFood}
                                    disabled={!newFoodName}
                                    className="flex-1 p-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg disabled:opacity-50"
                                >
                                    Save Food
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <AnimatePresence mode="popLayout">
                            {foods?.map((food) => (
                                <motion.div
                                    key={food._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-background text-foreground">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{food.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFood(food._id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {foods?.length === 0 && !isAddingFood && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No custom foods yet. Add one to get started!
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {showIconPicker && (
                <IconPicker
                    onSelect={(icon) => {
                        setSelectedIcon(icon);
                        setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                />
            )}
        </div>
    );
}
