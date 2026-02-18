import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";

interface StoryCardProps {
    story: {
        id: string;
        title: string;
        description: string;
        content: string;
        image_url?: string | null;
        author?: string | null;
        created_at: string;
    };
    onClick?: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={onClick}
            className="group relative bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
        >
            {/* Visual Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-80" />

            {story.image_url && (
                <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6">
                        <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" />
                            Community Story
                        </span>
                    </div>
                </div>
            )}

            <div className="p-8">
                {!story.image_url && (
                    <div className="mb-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" />
                            Community Story
                        </span>
                    </div>
                )}

                <h2 className="text-2xl font-black text-slate-800 leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
                    {story.title}
                </h2>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {story.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">{story.author || "Bodham Contributor"}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(story.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
