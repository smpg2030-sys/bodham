export default function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto">
            {/* Header Skeleton */}
            <div className="bg-white rounded-[2rem] p-8 mb-6 border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="flex flex-col items-center text-center">
                    {/* Avatar Skeleton */}
                    <div className="w-32 h-32 rounded-[2.5rem] animate-shimmer mb-6 shadow-xl" />

                    {/* Name & Badge Skeleton */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-48 h-8 rounded-xl animate-shimmer" />
                        <div className="w-6 h-6 rounded-full animate-shimmer" />
                    </div>

                    <div className="w-32 h-4 rounded-lg animate-shimmer opacity-60 mb-6" />

                    {/* Stats Skeleton */}
                    <div className="flex gap-12 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-6 rounded-lg animate-shimmer mb-1" />
                                <div className="w-16 h-3 rounded-md animate-shimmer opacity-50" />
                            </div>
                        ))}
                    </div>

                    {/* Bio Skeleton */}
                    <div className="w-full space-y-2 mb-8 max-w-sm">
                        <div className="w-full h-4 rounded-md animate-shimmer" />
                        <div className="w-2/3 h-4 rounded-md animate-shimmer mx-auto" />
                    </div>

                    {/* Actions Skeleton */}
                    <div className="flex gap-3 w-full">
                        <div className="flex-1 h-14 rounded-2xl animate-shimmer" />
                        <div className="w-14 h-14 rounded-2xl animate-shimmer" />
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 h-11 rounded-xl animate-shimmer" />
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="aspect-square bg-slate-100 animate-shimmer rounded-sm" />
                ))}
            </div>
        </div>
    );
}
