import type { Tables } from "./database.types";

// Database table types
export type Profile = Tables<"profiles">;
export type Post = Tables<"posts">;
export type Like = Tables<"likes">;

export type PostExtended = Post & {
	author: {
		id: string;
		username: string;
	};
	isLiked: boolean;
	like_count: number;
	likes: Like[];
	isRemoving?: boolean; // For smooth removal animation
};

export type FilterType = "all" | "mine" | "liked";

export interface PostFilters {
	search: string;
	filter: FilterType;
}

export interface AuthUser {
	id: string;
	username: string;
	email?: string;
}
