import { useUser, useClerk } from "@clerk/nextjs";
import SyncData from "../../components/SyncData";
import { Settings, Shield, Mail, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
    const { user } = useUser();
    const { openUserProfile } = useClerk();

    if (!user) return null;

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8 pb-24 sm:pb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account and data.</p>
            </div>

            {/* Custom Profile Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative">
                    <img
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        className="w-24 h-24 rounded-full border-4 border-background shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full"></div>
                </div>

                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold">{user.fullName}</h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                </div>

                <button
                    onClick={() => openUserProfile()}
                    className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Manage Account
                </button>
            </div>

            <div className="grid gap-4">
                <h3 className="text-lg font-semibold ml-1">Data Management</h3>
                <SyncData />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <button
                    onClick={() => openUserProfile({ routing: "hash" })}
                    className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium">Account Details</p>
                            <p className="text-xs text-muted-foreground">Update name and photo</p>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                    onClick={() => openUserProfile({ routing: "hash" })}
                    className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium">Security</p>
                            <p className="text-xs text-muted-foreground">Password and 2FA</p>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
}
