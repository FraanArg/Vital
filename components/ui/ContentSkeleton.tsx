"use client";

import clsx from "clsx";
import { CSSProperties } from "react";

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;
}

// Base Skeleton with pulse animation
export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={clsx(
                "animate-pulse bg-muted rounded-lg",
                className
            )}
            style={style}
        />
    );
}

// Card Skeleton - for dashboard cards
export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={clsx("bg-card border border-border/50 rounded-2xl p-4 space-y-3", className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
        </div>
    );
}

// List Item Skeleton
export function ListItemSkeleton({ className }: SkeletonProps) {
    return (
        <div className={clsx("flex items-center gap-3 p-3", className)}>
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
    );
}

// Chart Skeleton
export function ChartSkeleton({ className }: SkeletonProps) {
    return (
        <div className={clsx("bg-card border border-border/50 rounded-2xl p-4", className)}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <div className="flex items-end gap-2 h-48">
                {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

// Stats Ring Skeleton
export function RingSkeleton({ className }: SkeletonProps) {
    return (
        <div className={clsx("flex items-center justify-center", className)}>
            <Skeleton className="w-32 h-32 rounded-full" />
        </div>
    );
}

// Dashboard Grid Skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            {/* Date Selector */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Skeleton key={i} className="w-12 h-16 rounded-xl" />
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Chart */}
            <ChartSkeleton />
        </div>
    );
}

// Foods List Skeleton
export function FoodsListSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <ListItemSkeleton key={i} />
            ))}
        </div>
    );
}

// Stats Page Skeleton
export function StatsPageSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RingSkeleton className="h-48" />
                <ChartSkeleton />
            </div>
            <ChartSkeleton />
        </div>
    );
}

export default Skeleton;
