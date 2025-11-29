"use client";

import { UserProfile } from "@clerk/nextjs";
import SyncData from "../../components/SyncData";

export default function ProfilePage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account and data.</p>
            </div>

            <SyncData />

            <div className="flex justify-center">
                <UserProfile routing="hash" />
            </div>
        </div>
    );
}
