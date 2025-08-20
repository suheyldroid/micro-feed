import { useAuth } from "@/contexts/auth-context";
import { fetchPostsServerAction } from "@/lib/actions/posts";
import type { FilterType } from "@/types";
import { useQuery } from "@tanstack/react-query";
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
	} = useQuery({
		queryKey: ["posts", user?.id, search, filter],
		queryFn: () =>
			fetchPostsServerAction({
				search: search,
				filter,
			}),
		staleTime: 1000 * 60 * 2, // 2 minutes
		refetchOnWindowFocus: false,
	});

	const posts = postsData?.posts || [];

	return {
		posts,
		isLoadingPosts,
		error: postsError,
		refetch,
		search,
		filter,
	};
}
