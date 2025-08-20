"use server";

import {
	createAuthenticatedSupabaseClient,
	createServerSupabaseClient,
} from "@/lib/supabase-server";
import { type PostFormData, postSchema } from "@/lib/validations";
import type { FilterType, Post, PostExtended } from "@/types";
import { revalidatePath } from "next/cache";

export interface PostsResponse {
	posts: PostExtended[];
	totalCount: number;
}

export interface FetchPostsParams {
	page?: number;
	limit?: number;
	search?: string;
	filter?: FilterType;
}

interface PostActionResult {
	success: boolean;
	error?: string;
	data?: Post;
}

interface DeleteActionResult {
	success: boolean;
	error?: string;
}

export async function createPostAction(
	data: PostFormData,
): Promise<PostActionResult> {
	try {
		// Validate input data with Zod
		const validatedData = postSchema.parse(data);

		// Get authenticated client and user
		const { supabase, user } = await createAuthenticatedSupabaseClient();

		// Create post
		const { data: postData, error } = await supabase
			.from("posts")
			.insert({
				content: validatedData.content,
				author_id: user.id,
			})
			.select(
				`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username
				),
				likes (
					post_id,
					user_id,
					created_at
				)
			`,
			)
			.single();

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Transform to PostExtended type
		const post: PostExtended = {
			...postData,
			author: {
				id: postData.author.id,
				username: postData.author.username,
			},
			like_count: postData.likes?.length || 0,
			likes: postData.likes || [],
			isLiked: false, // New post, user hasn't liked it yet
		};

		// Revalidate posts data
		revalidatePath("/");

		return {
			success: true,
			data: post,
		};
	} catch (error) {
		console.error("Create post error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create post",
		};
	}
}

export async function updatePostAction(
	postId: string,
	data: PostFormData,
): Promise<PostActionResult> {
	try {
		// Validate input data with Zod
		const validatedData = postSchema.parse(data);

		// Get authenticated client and user
		const { supabase, user } = await createAuthenticatedSupabaseClient();

		// Update post (RLS will ensure user can only update their own posts)
		const { data: postData, error } = await supabase
			.from("posts")
			.update({
				content: validatedData.content,
				updated_at: new Date().toISOString(),
			})
			.eq("id", postId)
			.eq("author_id", user.id) // Extra safety check
			.select(
				`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username
				),
				likes (
					post_id,
					user_id,
					created_at
				)
			`,
			)
			.single();

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Check if user has liked this post
		const userLike = postData.likes?.find((like) => like.user_id === user.id);

		// Transform to PostExtended type
		const post: PostExtended = {
			...postData,
			author: {
				id: postData.author.id,
				username: postData.author.username,
			},
			like_count: postData.likes?.length || 0,
			likes: postData.likes || [],
			isLiked: !!userLike,
		};

		// Revalidate posts data
		revalidatePath("/");

		return {
			success: true,
			data: post,
		};
	} catch (error) {
		console.error("Update post error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to update post",
		};
	}
}

export async function deletePostAction(
	postId: string,
): Promise<DeleteActionResult> {
	try {
		// Get authenticated client and user
		const { supabase, user } = await createAuthenticatedSupabaseClient();

		// Delete post (RLS will ensure user can only delete their own posts)
		const { error } = await supabase
			.from("posts")
			.delete()
			.eq("id", postId)
			.eq("author_id", user.id); // Extra safety check

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Revalidate posts data
		revalidatePath("/");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Delete post error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to delete post",
		};
	}
}

export async function likePostAction(
	postId: string,
): Promise<DeleteActionResult> {
	try {
		// Get authenticated client and user
		const { supabase, user } = await createAuthenticatedSupabaseClient();

		// Add like
		const { error } = await supabase.from("likes").insert({
			post_id: postId,
			user_id: user.id,
		});

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Revalidate posts data
		revalidatePath("/");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Like post error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to like post",
		};
	}
}

export async function unlikePostAction(
	postId: string,
): Promise<DeleteActionResult> {
	try {
		// Get authenticated client and user
		const { supabase, user } = await createAuthenticatedSupabaseClient();

		// Remove like
		const { error } = await supabase
			.from("likes")
			.delete()
			.eq("post_id", postId)
			.eq("user_id", user.id);

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		// Revalidate posts data
		revalidatePath("/");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unlike post error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to unlike post",
		};
	}
}

export async function fetchPostsServerAction({
	page = 1,
	limit = 20,
	search,
	filter = "all",
}: FetchPostsParams): Promise<PostsResponse> {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("User not found");
		}

		let query = supabase.from("posts").select(`
      id,
      content,
      author_id,
      created_at,
      updated_at,
      profiles!posts_author_id_fkey (
        id,
        username
      ),
      likes (
        user_id,
        created_at
      )
    `);

		// Apply filters
		if (filter === "mine") {
			query = query.eq("author_id", user.id);
		} else if (filter === "liked") {
			query = query.in(
				"id",
				(
					await supabase.from("likes").select("post_id").eq("user_id", user.id)
				).data?.map((like) => like.post_id) ?? [],
			);
		}

		// Apply search
		if (search?.trim()) {
			query = query.or(
				`content.ilike.%${search}%,profiles.username.ilike.%${search}%`,
			);
		}

		// Apply pagination and ordering
		const { data, error, count } = await query
			.order("created_at", { ascending: false })
			.range((page - 1) * limit, page * limit - 1);

		if (error) {
			throw new Error(`Failed to fetch posts: ${error.message}`);
		}

		// Transform the data to match our PostExtended interface
		const posts: PostExtended[] = data?.map((item) => ({
			id: item.id,
			content: item.content,
			author_id: item.author_id,
			author: {
				id: item.profiles.id,
				username: item.profiles.username,
			},
			created_at: item.created_at,
			updated_at: item.updated_at,
			likes: item.likes.map((like) => ({
				post_id: item.id,
				user_id: like.user_id,
				created_at: like.created_at,
			})),
			like_count: item.likes?.length || 0,
			isLiked: item.likes?.some((like) => like.user_id === user.id) || false,
		}));

		return {
			posts,
			totalCount: count || 0,
		};
	} catch (error) {
		console.error("Fetch posts error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch posts",
		);
	}
}

// Server-side function to get user's posts (for server components)
export async function getUserPosts(userId: string): Promise<PostExtended[]> {
	try {
		const supabase = await createServerSupabaseClient();

		const { data: posts, error } = await supabase
			.from("posts")
			.select(
				`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username
				),
				likes (
					post_id,
					user_id,
					created_at
				)
			`,
			)
			.eq("author_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching user posts:", error);
			return [];
		}

		// Transform to PostExtended type
		return (
			posts?.map((post) => ({
				...post,
				author: {
					id: post.author.id,
					username: post.author.username,
				},
				like_count: post.likes?.length || 0,
				isLiked: post.likes?.some((like) => like.user_id === userId) || false,
				likes: post.likes || [],
			})) || []
		);
	} catch (error) {
		console.error("Error in getUserPosts:", error);
		return [];
	}
}
