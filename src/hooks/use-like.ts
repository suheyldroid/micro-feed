import { useAuth } from "@/contexts/auth-context";
import {
	likePostAction,
	unlikePostAction,
	type PostsResponse,
} from "@/lib/actions/posts";
import type { FilterType, PostExtended } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";

export function useLike() {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Debounce invalidate
	const invalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pendingMutationsRef = useRef<Set<string>>(new Set());

	// Debounced invalidate function - only when no mutations are pending
	const debouncedInvalidate = () => {
		if (invalidateTimeoutRef.current) {
			clearTimeout(invalidateTimeoutRef.current);
		}

		invalidateTimeoutRef.current = setTimeout(() => {
			// Only invalidate if no mutations are pending
			if (pendingMutationsRef.current.size === 0) {
				queryClient.invalidateQueries({ queryKey: ["posts"] });
			}
		}, 500); // Increased to 500ms
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (invalidateTimeoutRef.current) {
				clearTimeout(invalidateTimeoutRef.current);
			}
		};
	}, []);

	// URL query state'leri al
	const [{ search, filter }] = useQueryStates({
		search: {
			defaultValue: "",
			serialize: (value) => value,
			parse: (value) => value,
		},
		filter: {
			defaultValue: "all" as FilterType,
			serialize: (value) => value,
			parse: (value) => value as FilterType,
		},
	});

	// Tüm filter'lar için query key'leri oluştur
	const allQueryKeys = [
		["posts", user?.id, search, "all" as FilterType],
		["posts", user?.id, search, "mine" as FilterType],
		["posts", user?.id, search, "liked" as FilterType],
	];

	const toggleLikeMutation = useMutation({
		mutationFn: async (post: PostExtended) => {
			// Add to pending mutations
			const mutationKey = `${post.id}-${post.isLiked ? 'unlike' : 'like'}`;
			pendingMutationsRef.current.add(mutationKey);

			try {
				let result: { success: boolean; error?: string };
				if (post.isLiked) {
					result = await unlikePostAction(post.id);
				} else {
					result = await likePostAction(post.id);
				}

				if (!result.success) {
					throw new Error(result.error || "Failed to toggle like");
				}

				return post;
			} finally {
				// Remove from pending mutations
				pendingMutationsRef.current.delete(mutationKey);
			}
		},
		onMutate: async (post) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: allQueryKeys });

			// Snapshot the previous value for all queries
			const previousData = allQueryKeys.map(key => ({
				key,
				data: queryClient.getQueryData(key)
			}));

			// Check if user exists
			if (!user?.id) {
				throw new Error("User not authenticated");
			}

			// Create updated post
			const updatedPost = {
				...post,
				isLiked: !post.isLiked,
				like_count: post.isLiked ? post.like_count - 1 : post.like_count + 1,
				likes: post.isLiked
					? (post.likes || []).filter((like) => like.user_id !== user.id)
					: [
							...(post.likes || []),
							{
								post_id: post.id,
								user_id: user.id,
								created_at: new Date().toISOString(),
							},
						],
			};

			// Update all queries optimistically
			allQueryKeys.forEach(queryKey => {
				const [, , , filterType] = queryKey;

				queryClient.setQueryData(queryKey, (oldData: PostsResponse) => {
					if (!oldData) return oldData;

					if (filterType === "liked") {
						// Liked filter için özel logic
						if (updatedPost.isLiked) {
							// Like ediliyorsa, listeye ekle (eğer yoksa)
							const exists = oldData.posts.some(p => p.id === post.id);
							if (!exists) {
								return {
									...oldData,
									posts: [updatedPost, ...oldData.posts],
								};
							}
						} else {
							// Unlike ediliyorsa, önce animasyon için isRemoving true yap
							return {
								...oldData,
								posts: oldData.posts.map((p: PostExtended) =>
									p.id === post.id
										? { ...p, isRemoving: true }
										: p
								),
							};
						}
					}

					// Diğer filter'lar için normal update
					return {
						...oldData,
						posts: oldData.posts.map((p: PostExtended) =>
							p.id === post.id ? updatedPost : p,
						),
					};
				});
			});

			// Return a context object with the snapshotted values
			return { previousData };
		},
		onSuccess: (_, variables) => {
			// Server'dan güncel veri almak için debounced invalidate kullan
			debouncedInvalidate();

			// Liked filter'da unlike yapıldıysa, animasyon sonrası post'u kaldır
			const currentFilter = filter; // URL'den gelen filter
			if (currentFilter === "liked" && !variables.isLiked) {
				setTimeout(() => {
					queryClient.setQueryData(
						["posts", user?.id, search, "liked"],
						(oldData: PostsResponse) => ({
							...oldData,
							posts: oldData.posts.filter((p: PostExtended) => p.id !== variables.id),
						})
					);
				}, 300); // Animation süresi kadar bekle
			}
		},
		onError: (_, variables, context) => {
			// Tüm query'leri eski hallerine döndür
			if (context?.previousData) {
				context.previousData.forEach(({ key, data }) => {
					if (data) {
						queryClient.setQueryData(key, data);
					}
				});
			}

			// Hata durumunda isRemoving flag'ini temizle
			if (variables && !variables.isLiked) {
				queryClient.setQueryData(
					["posts", user?.id, search, "liked"],
					(oldData: PostsResponse) => ({
						...oldData,
						posts: oldData.posts.map((p: PostExtended) =>
							p.id === variables.id
								? { ...p, isRemoving: false }
								: p
						),
					})
				);
			}
		},
	});

	return {
		toggleLike: toggleLikeMutation.mutate,
		isLoading: toggleLikeMutation.isPending,
	};
}
