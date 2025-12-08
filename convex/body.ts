import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { subDays } from "date-fns";

// ============================================
// GET MEASUREMENTS HISTORY
// ============================================
export const getMeasurements = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const daysBack = args.days || 90;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const measurements = await ctx.db
            .query("bodyMeasurements")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        return measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
});

// ============================================
// GET LATEST MEASUREMENT
// ============================================
export const getLatest = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        const measurements = await ctx.db
            .query("bodyMeasurements")
            .withIndex("by_user_date", (q) => q.eq("userId", userId))
            .order("desc")
            .take(1);

        return measurements[0] || null;
    },
});

// ============================================
// ADD MEASUREMENT
// ============================================
export const addMeasurement = mutation({
    args: {
        date: v.string(),
        weight: v.optional(v.number()),
        bodyFat: v.optional(v.number()),
        chest: v.optional(v.number()),
        waist: v.optional(v.number()),
        hips: v.optional(v.number()),
        arms: v.optional(v.number()),
        thighs: v.optional(v.number()),
        neck: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        // Check if measurement exists for this date
        const existing = await ctx.db
            .query("bodyMeasurements")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                weight: args.weight,
                bodyFat: args.bodyFat,
                chest: args.chest,
                waist: args.waist,
                hips: args.hips,
                arms: args.arms,
                thighs: args.thighs,
                neck: args.neck,
                notes: args.notes,
            });
            return existing._id;
        }

        // Create new
        return await ctx.db.insert("bodyMeasurements", {
            userId,
            date: args.date,
            weight: args.weight,
            bodyFat: args.bodyFat,
            chest: args.chest,
            waist: args.waist,
            hips: args.hips,
            arms: args.arms,
            thighs: args.thighs,
            neck: args.neck,
            notes: args.notes,
        });
    },
});

// ============================================
// DELETE MEASUREMENT
// ============================================
export const deleteMeasurement = mutation({
    args: { id: v.id("bodyMeasurements") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.delete(args.id);
    },
});

// ============================================
// BODY STATS (BMI, TDEE, etc.)
// ============================================
export const getBodyStats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        // Get profile and latest measurement
        const [profile, latestMeasurement] = await Promise.all([
            ctx.db.query("userProfile").withIndex("by_user", (q) => q.eq("userId", userId)).first(),
            ctx.db.query("bodyMeasurements").withIndex("by_user_date", (q) => q.eq("userId", userId))
                .order("desc").take(1),
        ]);

        if (!profile) return null;

        const weight = latestMeasurement[0]?.weight || profile.weight;
        const height = profile.height;
        const age = profile.age;

        if (!weight || !height) return null;

        // Calculate BMI
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        let bmiCategory: string;
        if (bmi < 18.5) bmiCategory = "Underweight";
        else if (bmi < 25) bmiCategory = "Normal";
        else if (bmi < 30) bmiCategory = "Overweight";
        else bmiCategory = "Obese";

        // Calculate TDEE (using Mifflin-St Jeor equation)
        // For simplicity, assuming male. Could add gender to profile later.
        let bmr = 10 * weight + 6.25 * height - 5 * (age || 30) + 5;

        // Activity multiplier (assume moderately active)
        const tdee = bmr * 1.55;

        // Get weight change over last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const recentMeasurements = await ctx.db
            .query("bodyMeasurements")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).gte("date", thirtyDaysAgo))
            .collect();

        let weightChange = null;
        const weightMeasurements = recentMeasurements.filter(m => m.weight).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (weightMeasurements.length >= 2) {
            const first = weightMeasurements[0].weight!;
            const last = weightMeasurements[weightMeasurements.length - 1].weight!;
            weightChange = last - first;
        }

        return {
            weight,
            height,
            bmi: Math.round(bmi * 10) / 10,
            bmiCategory,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            weightChange: weightChange !== null ? Math.round(weightChange * 10) / 10 : null,
            measurementCount: recentMeasurements.length,
        };
    },
});

// ============================================
// PROGRESS COMPARISON
// ============================================
export const getProgress = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        // Get first and latest measurement
        const allMeasurements = await ctx.db
            .query("bodyMeasurements")
            .withIndex("by_user_date", (q) => q.eq("userId", userId))
            .collect();

        if (allMeasurements.length < 2) return null;

        const sorted = allMeasurements.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const first = sorted[0];
        const latest = sorted[sorted.length - 1];

        const changes: { metric: string; first: number | null; latest: number | null; change: number | null; unit: string }[] = [];

        const metrics = [
            { key: "weight", label: "Weight", unit: "kg" },
            { key: "bodyFat", label: "Body Fat", unit: "%" },
            { key: "waist", label: "Waist", unit: "cm" },
            { key: "chest", label: "Chest", unit: "cm" },
            { key: "arms", label: "Arms", unit: "cm" },
            { key: "thighs", label: "Thighs", unit: "cm" },
        ];

        for (const metric of metrics) {
            const firstVal = first[metric.key as keyof typeof first] as number | undefined;
            const latestVal = latest[metric.key as keyof typeof latest] as number | undefined;

            if (firstVal !== undefined && latestVal !== undefined) {
                changes.push({
                    metric: metric.label,
                    first: firstVal,
                    latest: latestVal,
                    change: Math.round((latestVal - firstVal) * 10) / 10,
                    unit: metric.unit,
                });
            }
        }

        return {
            firstDate: first.date,
            latestDate: latest.date,
            daysBetween: Math.round((new Date(latest.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)),
            changes,
        };
    },
});
