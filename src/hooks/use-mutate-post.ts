import { useAuth } from "@/contexts/auth-context";
import { createPostAction, deletePostAction, updatePostAction, type PostsResponse } from "@/lib/actions/posts";
import type { FilterType, Post, PostFormData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

interface UseMutatePostOptions {
	onSuccess?: () => void;
}

export function useMutatePost({ onSuccess }: UseMutatePostOptions) {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// URL query state'leri al
	const [{ search, filter }] = useQueryStates({
		search: { defaultValue: "", serialize: (value) => value, parse: (value) => value },
		filter: { defaultValue: "all" as FilterType, serialize: (value) => value, parse: (value) => value as FilterType },
	});

	const queryKey = ["posts", user?.id, search, filter];

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: async (data: PostFormData) => {
			const result = await createPostAction(data);
			if (!result.success) {
				throw new Error(result.error || "Failed to create post");
			}
			return result.data!;
		},
		onSuccess: (newPost) => {
			// Update cache by adding new post to the beginning
			queryClient.setQueryData(
				queryKey,
				(oldData: PostsResponse) => ({
					...oldData,
					posts: [newPost, ...oldData.posts],
				})
			);
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
			return result.data!;
		},
		onSuccess: (updatedPost) => {
			// Update cache by replacing the post
			queryClient.setQueryData(
				queryKey,
				(oldData: PostsResponse) => ({
					...oldData,
					posts: oldData.posts.map((post: Post) =>
						post.id === updatedPost.id ? { ...updatedPost, is_liked: post.is_liked, like_count: post.like_count, likes: post.likes } : post
					),
				})
			);
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
		onSuccess: (_, deletedPostId) => {
			// Update cache by removing the deleted post
			queryClient.setQueryData(
				queryKey,
				(oldData: PostsResponse) => ({
					...oldData,
					posts: oldData.posts.filter((post: Post) => post.id !== deletedPostId),
				})
			);
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
