import { useAuth } from "@/contexts/auth-context";
import {
	createPostAction,
	deletePostAction,
	updatePostAction,
} from "@/lib/actions/posts";
import type { PostFormData } from "@/lib/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseMutatePostOptions {
	onSuccess?: () => void;
}

export function useMutatePost({ onSuccess }: UseMutatePostOptions = {}) {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Invalidate all posts queries - simpler and more reliable
	const invalidatePostsQueries = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: ["posts", user?.id],
			exact: false,
		});
	}, [queryClient, user?.id]);

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
		onSuccess: () => {
			// Invalidate all posts queries to refetch fresh data
			invalidatePostsQueries();
			onSuccess?.();
		},
	});

	// Update post mutation
	const updatePostMutation = useMutation({
		mutationFn: async ({
			postId,
			data,
		}: {
			postId: string;
			data: PostFormData;
		}) => {
			const result = await updatePostAction(postId, data);
			if (!result.success) {
				throw new Error(result.error || "Failed to update post");
			}
			if (!result.data) {
				throw new Error("No data returned from update post");
			}
			return result.data;
		},
		onSuccess: () => {
			// Invalidate all posts queries to refetch fresh data
			invalidatePostsQueries();
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
		onSuccess: () => {
			// Invalidate all posts queries to refetch fresh data
			invalidatePostsQueries();
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
