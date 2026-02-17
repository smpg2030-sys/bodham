export interface User {
    id: string;
    email: string;
    full_name?: string | null;
    role?: string; // "user" | "host" | "admin"
    is_verified?: boolean;
    is_verified_host?: boolean;
    host_status?: "none" | "pending" | "approved" | "rejected";
    seller_status?: "none" | "pending" | "approved" | "rejected";
    business_name?: string | null;
    profile_pic?: string | null;
    bio?: string | null;
    mobile?: string | null;
    created_at?: string | null;
    last_active_at?: string | null;
    streak_count?: number;
}

export interface LiveRoom {
    id: string;
    hostId: string;
    title: string;
    type: "group" | "private";
    access: "free" | "paid";
    price: number;
    scheduledAt: string;
    scheduled_at?: string;
    duration: number; // in minutes
    status: "upcoming" | "live" | "ended";
    totalAttendees: number;
    total_attendees?: number;
    totalRevenue: number;
    total_revenue?: number;
    platformCommission: number;
    platform_commission?: number;
    createdAt: string;
    created_at?: string;
    host_id?: string;
}

export interface SessionAttendance {
    roomId: string;
    room_id?: string;
    userId: string;
    user_id?: string;
    joinedAt: string;
    joined_at?: string;
    leftAt?: string;
    left_at?: string;
    stayDuration: number;
    stay_duration?: number;
    paymentStatus: "paid" | "free";
    payment_status?: "paid" | "free";
}

export interface SessionPayment {
    userId: string;
    roomId: string;
    amount: number;
    transactionId: string;
    paymentStatus: "success" | "failed";
    createdAt: string;
}

export interface HostEarnings {
    hostId: string;
    roomId: string;
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    payoutStatus: "processing" | "completed";
}

export interface Post {
    id: string;
    user_id: string;
    author_name: string;
    author_email?: string;
    content: string;
    image_url?: string;
    video_url?: string;
    status: "pending" | "approved" | "rejected" | "flagged";
    created_at: string;
    rejection_reason?: string;
    moderation_status?: "pending" | "approved" | "rejected" | "flagged";
    moderation_category?: string;
    moderation_score?: number;
    moderation_source?: "AI" | "admin_override";
    moderation_logs?: {
        action: string;
        timestamp: string;
        operator: string;
        reason?: string;
        details?: string[];
    }[];
    author_profile_pic?: string | null;
    likes_count: number;
    comments_count: number;
    is_liked_by_me: boolean;
}

export interface Comment {
    id: string;
    user_id: string;
    author_name: string;
    author_profile_pic?: string | null;
    content: string;
    created_at: string;
}

export interface Video {
    id: string;
    user_id: string;
    author_name: string;
    author_email?: string;
    title?: string;
    caption?: string;
    video_url: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    rejection_reason?: string;
}

export interface FriendRequest {
    request_id: string;
    from_user_id: string;
    from_user_name: string;
    created_at: string;
}

export interface AppFriend {
    id: string;
    full_name: string | null;
    email: string;
    profile_pic?: string | null;
}

export interface AppNotification {
    id: string;
    message: string;
    type: "friend_request" | "request_accepted" | "general";
    created_at: string;
}

export interface CommunityStory {
    id: string;
    title: string;
    description: string;
    content: string;
    image_url?: string;
    author?: string;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    title?: string;
    content: string;
    date: string;
    created_at: string;
}

export interface Product {
    id: string;
    seller_id: string;
    seller_name?: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    category?: string;
    status: "active" | "inactive";
    created_at: string;
}
