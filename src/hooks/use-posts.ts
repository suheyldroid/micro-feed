import { useAuth } from "@/contexts/auth-context";
import { fetchPostsServerAction } from "@/lib/actions/posts";
import type { FilterType } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

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

	const {
		data: postsData,
		isLoading: isLoadingPosts,
		error: postsError,
		refetch,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ["posts", user?.id, search, filter],
		queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
			fetchPostsServerAction({
				cursor: pageParam,
				search: search,
				filter,
			}),
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchOnWindowFocus: false,
		// Cursor pagination için
		getNextPageParam: (lastPage) => {
			return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
		},
		initialPageParam: undefined as string | undefined,
		enabled: !!user?.id, // Only fetch when user is available
	});

	// Flatten all pages
	const posts = postsData?.pages.flatMap(page => page.posts) || [];

	return {
		posts,
		postsData, // Return raw pages data for optimistic updates
		isLoadingPosts,
		error: postsError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		search,
		filter,
	};
}
