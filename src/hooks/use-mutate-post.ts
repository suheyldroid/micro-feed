import { useAuth } from "@/contexts/auth-context";
import { createPostAction, deletePostAction, updatePostAction, type PostsResponse } from "@/lib/actions/posts";
import type { FilterType, PostExtended, PostFormData } from "@/types";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

interface UseMutatePostOptions {
	onSuccess?: () => void;
}

export function useMutatePost({ onSuccess }: UseMutatePostOptions = {}) {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// URL query state'leri al
	const [{ search }] = useQueryStates({
		search: { defaultValue: "", serialize: (value) => value, parse: (value) => value },
		filter: { defaultValue: "all" as FilterType, serialize: (value) => value, parse: (value) => value as FilterType },
	});

	// Tüm filter'lar için query key'leri oluştur
	const allQueryKeys = [
		["posts", user?.id, search, "all" as FilterType],
		["posts", user?.id, search, "mine" as FilterType],
		["posts", user?.id, search, "liked" as FilterType],
	];

	// Helper function to update infinite query data
	const updateInfiniteQueryData = (
		queryKey: string[],
		updateFn: (posts: PostExtended[]) => PostExtended[]
	) => {
		queryClient.setQueryData(queryKey, (oldData: InfiniteData<PostsResponse>) => {
			if (!oldData) return oldData;

			return {
				...oldData,
				pages: oldData.pages.map(page => ({
					...page,
					posts: updateFn(page.posts),
				})),
			};
		});
	};

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: async (data: PostFormData) => {
			const result = await createPostAction(data);
			if (!result.success) {
				throw new Error(result.error || "Failed to create post");
			}
			if (!result.data) {
				throw new Error("No data returned from create post");
			}
			return result.data;
		},
		onSuccess: (newPost) => {
			// Update all relevant infinite queries
			allQueryKeys.forEach(queryKey => {
				const [, , , filterType] = queryKey;
				
				// Only add to queries that should include this post
				if (filterType === "all" || (filterType === "mine" && newPost.author_id === user?.id)) {
					updateInfiniteQueryData(queryKey, (posts) => [newPost, ...posts]);
				}
			});
			
			onSuccess?.();
		},
	});

	// Update post mutation
	const updatePostMutation = useMutation({
		mutationFn: async ({ postId, data }: { postId: string; data: PostFormData }) => {
			const result = await updatePostAction(postId, data);
			if (!result.success) {
				throw new Error(result.error || "Failed to update post");
			}
			if (!result.data) {
				throw new Error("No data returned from update post");
			}
			return result.data;
		},
		onSuccess: (updatedPost) => {
			// Update all infinite queries
			allQueryKeys.forEach(queryKey => {
				updateInfiniteQueryData(queryKey, (posts) =>
					posts.map((post: PostExtended) =>
						post.id === updatedPost.id ? { ...updatedPost, isLiked: post.isLiked, like_count: post.like_count, likes: post.likes } : post
					)
				);
			});
			
			onSuccess?.();
		},
	});

	// Delete post mutation
	const deletePostMutation = useMutation({
		mutationFn: async (postId: string) => {
			const result = await deletePostAction(postId);
			if (!result.success) {
				throw new Error(result.error || "Failed to delete post");
			}
			return postId;
		},
		onSuccess: (deletedPostId) => {
			// Remove from all infinite queries
			allQueryKeys.forEach(queryKey => {
				updateInfiniteQueryData(queryKey, (posts) =>
					posts.filter((post: PostExtended) => post.id !== deletedPostId)
				);
			});
		},
	});

	return {
		createPost: createPostMutation.mutate,
		updatePost: updatePostMutation.mutate,
		deletePost: deletePostMutation.mutate,
		isCreating: createPostMutation.isPending,
		isUpdating: updatePostMutation.isPending,
		isDeleting: deletePostMutation.isPending,
	};
}
