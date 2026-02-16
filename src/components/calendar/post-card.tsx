"use client";

import { cn } from "@/lib/utils";
import type { SocialNetwork } from "@/types";

interface PostCardProps {
    post: {
        id: string;
        title: string;
        status: string;
        socialNetwork: SocialNetwork;
        rubric: { name: string } | null;
    };
    onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full cursor-pointer rounded px-1.5 py-0.5 text-left text-[11px] transition-all hover:brightness-110 truncate block",
            )}
            style={{
                backgroundColor: `${post.socialNetwork.color}20`,
                color: post.socialNetwork.color,
                borderLeft: `2px solid ${post.socialNetwork.color}`,
            }}
            title={`${post.title} (${post.socialNetwork.name})`}
        >
            {post.title || post.rubric?.name || "Пост"}
        </button>
    );
}
