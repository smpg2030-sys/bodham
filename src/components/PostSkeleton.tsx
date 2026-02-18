import { motion } from "framer-motion";

export default function PostSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm">
            {/* Header: Avatar and Name */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl animate-shimmer" />
                <div className="flex flex-col gap-2">
                    <div className="w-24 h-4 rounded-md animate-shimmer" />
                    <div className="w-16 h-3 rounded-md animate-shimmer opacity-60" />
                </div>
            </div>

            {/* Content lines */}
            <div className="space-y-2 mb-4">
                <div className="w-full h-4 rounded-md animate-shimmer" />
                <div className="w-3/4 h-4 rounded-md animate-shimmer" />
            </div>

            {/* Main Image/Media area if any (optional but good for variety) */}
            <div className="w-full aspect-video rounded-2xl animate-shimmer mb-4" />

            {/* Footer: Stats */}
            <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full animate-shimmer" />
                    <div className="w-8 h-3 rounded-md animate-shimmer" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full animate-shimmer" />
                    <div className="w-8 h-3 rounded-md animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
