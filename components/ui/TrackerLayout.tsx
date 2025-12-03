import { X } from "lucide-react";

interface TrackerLayoutProps {
    title: string;
    icon?: React.ElementType;
    iconColor?: string;
    iconBgColor?: string;
    onClose: () => void;
    onBack?: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export default function TrackerLayout({
    title,
    icon: Icon,
    iconColor,
    iconBgColor,
    onClose,
    onBack,
    children,
    actions
}: TrackerLayoutProps) {
    return (
        <div className="space-y-6 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="text-sm text-muted-foreground hover:text-foreground mr-2"
                        >
                            ← Back
                        </button>
                    )}
                    {Icon && (
                        <div className={`p-2 rounded-full ${iconBgColor}`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                    )}
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {children}
        </div>
    );
}
