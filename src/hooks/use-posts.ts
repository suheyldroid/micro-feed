import { useAuth } from "@/contexts/auth-context";
import { fetchPostsServerAction } from "@/lib/actions/posts";
import type { FilterType } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";

export function usePosts() {
	const { user } = useAuth();

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

	// Debounced search term - 300ms delay, no character limit
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	// Debounce search with 300ms delay - works for any length
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);

		return () => clearTimeout(timer);
	}, [search]);

	// Memoize query key for stability - use debounced search
	const queryKey = useMemo(
		() => ["posts", user?.id, debouncedSearch, filter] as const,
		[user?.id, debouncedSearch, filter]
	);

	const {
		data: postsData,
		isLoading: isLoadingPosts,
		error: postsError,
		refetch,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		isError,
		isPending,
	} = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
			fetchPostsServerAction({
				page: pageParam || 1,
				search: debouncedSearch,
				filter,
			}),
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchOnWindowFocus: false,
		retry: 3, // Retry failed requests 3 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		// Offset pagination için
		getNextPageParam: (lastPage) => {
			return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
		},
		initialPageParam: 1 as number,
		enabled: !!user?.id, // Only fetch when user is available
	});

	// Flatten all pages
	const posts = postsData?.pages.flatMap(page => page.posts) || [];

	// Get pagination info from first page (all pages have same totalCount)
	const firstPage = postsData?.pages[0];
	const totalCount = firstPage?.totalCount || 0;
	const totalPages = firstPage?.totalPages || 0;
	const currentPage = postsData?.pages.length || 1;

	return {
		posts,
		postsData, // Return raw pages data for optimistic updates
		isLoadingPosts,
		error: postsError,
		isError,
		isPending,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		search,
		debouncedSearch,
		filter,
		// Search loading state
		isSearching: search !== debouncedSearch,
		// Pagination info
		totalCount,
		totalPages,
		currentPage,
	};
}
