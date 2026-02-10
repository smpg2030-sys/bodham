export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_verified?: boolean;
}

export interface Post {
    id: string;
    user_id: string;
    author_name: string;
    content: string;
    image_url?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    rejection_reason?: string;
}
