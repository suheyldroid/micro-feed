"use client";

import { Composer } from "@/components/composer";
import { LoadMoreTrigger } from "@/components/load-more-trigger";
import { PostCard } from "@/components/post-card";
import { PostSkeletonList } from "@/components/post-skeleton";
import { Toolbar } from "@/components/toolbar";
import { useAuth } from "@/contexts/auth-context";
import { usePosts } from "@/hooks/use-posts";
import type { FilterType, PostExtended } from "@/types";
import { useQueryStates } from "nuqs";
import { useState } from "react";

export function Feed() {
	const { user } = useAuth();
	const [composerOpen, setComposerOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<PostExtended | undefined>();

	const { 
		posts, 
		isLoadingPosts, 
		search, 
		filter, 
		fetchNextPage, 
		hasNextPage, 
		isFetchingNextPage 
	} = usePosts();

	// nuqs query state setter'ları
	const [, setQueryStates] = useQueryStates({
		search: { defaultValue: "", serialize: (value) => value, parse: (value) => value },
		filter: { defaultValue: "all" as FilterType, serialize: (value) => value, parse: (value) => value as FilterType },
	});

	const handleCreatePost = () => {
		setEditingPost(undefined);
		setComposerOpen(true);
	};

	if (!user) {
		return null; // This shouldn't happen as Feed is only rendered when authenticated
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-2xl mx-auto">
				<Toolbar
					searchValue={search}
					onSearchChange={(value) => setQueryStates({ search: value })}
					filter={filter}
					onFilterChange={(value) => setQueryStates({ filter: value })}
					onCreatePost={handleCreatePost}
				/>

				<div className="p-4 space-y-4">
					{isLoadingPosts ? (
						<PostSkeletonList count={5} />
					) : posts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								{search
									? "No posts found matching your search."
									: filter === "mine"
										? "You haven't created any posts yet."
										: filter === "liked"
											? "You haven't liked any posts yet."
											: "No posts yet. Create the first one!"}
							</p>
						</div>
					) : (
						<>
							{posts.map((post) => (
								<PostCard
									key={post.id}
									post={post}
								/>
							))}
							
							{/* Infinite scroll trigger */}
							<LoadMoreTrigger
								hasNextPage={hasNextPage}
								isFetchingNextPage={isFetchingNextPage}
								fetchNextPage={fetchNextPage}
								autoLoad={true}
							/>
						</>
					)}
				</div>
			</div>

			<Composer
				open={composerOpen}
				onOpenChange={setComposerOpen}
				editingPost={editingPost}
			/>
		</div>
	);
}
