"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Search, Trash2, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IconPicker from "../../components/ui/IconPicker";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Button } from "../../components/ui/Button";

export default function FoodDatabasePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [editingIconId, setEditingIconId] = useState<Id<"foodItems"> | null>(null);
    const [deleteId, setDeleteId] = useState<Id<"foodItems"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const foods = useQuery(api.foodItems.list);
    const removeFood = useMutation(api.foodItems.remove);
    const seedDefaults = useMutation(api.foodItems.seedDefaults);
    const updateIcon = useMutation(api.foodItems.updateIcon);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    const filteredFoods = foods?.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await removeFood({ id: deleteId });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleIconUpdate = async (id: Id<"foodItems">, icon: string) => {
        await updateIcon({ id, icon });
        setEditingIconId(null);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen page-padding flex flex-col items-center">
            <div className="container-mobile animate-fade-in space-y-6">
                <PageHeader
                    title="Food Database"
                    subtitle="Manage your saved food items"
                    actions={
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Utensils className="w-6 h-6 text-primary" />
                        </div>
                    }
                />

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border border-border/50 focus:ring-2 focus:ring-primary shadow-sm"
                    />
                </div>

                <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredFoods?.map((food) => (
                            <motion.div
                                key={food._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex items-center justify-between group hover:shadow-md transition-all relative"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <button
                                            onClick={() => setEditingIconId(editingIconId === food._id ? null : food._id)}
                                            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl hover:bg-secondary/80 transition-colors"
                                        >
                                            {food.icon || "🍽️"}
                                        </button>
                                        <AnimatePresence>
                                            {editingIconId === food._id && (
                                                <IconPicker
                                                    currentIcon={food.icon || "🍽️"}
                                                    foodName={food.name}
                                                    onSelect={(icon) => handleIconUpdate(food._id, icon)}
                                                    onClose={() => setEditingIconId(null)}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{food.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {food.category && <span className="px-2 py-0.5 bg-secondary rounded-full">{food.category}</span>}
                                            <span>Used {food.usage_count} times</span>
                                        </div>
                                    </div>
                                </div>
                                {food.userId && ( // Only allow deleting user's own items
                                    <button
                                        onClick={() => setDeleteId(food._id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Food"
                                        aria-label={`Delete ${food.name}`}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredFoods?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground space-y-4">
                            <div>
                                <p className="text-lg">No foods found.</p>
                                <p className="text-sm">Try adding some via the Food Tracker!</p>
                            </div>
                            <Button
                                onClick={() => seedDefaults()}
                            >
                                Load Default Foods
                            </Button>
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                    title="Delete food item?"
                    description="This item will be permanently removed from your food database."
                    confirmLabel="Delete"
                    variant="destructive"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}
