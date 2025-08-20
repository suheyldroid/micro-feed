"use client";

import { Composer } from "@/components/composer";
import { LoadMoreTrigger } from "@/components/load-more-trigger";
import { PostCard } from "@/components/post-card";
import { PostSkeletonList } from "@/components/post-skeleton";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
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
		isError,
		error,
		search, 
		filter, 
		fetchNextPage, 
		hasNextPage, 
		isFetchingNextPage,
		refetch
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

	const handleEditPost = (post: PostExtended) => {
		setEditingPost(post);
		setComposerOpen(true);
	};

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto">
				<Toolbar
					searchValue={search}
					onSearchChange={(value) => setQueryStates({ search: value })}
					filter={filter}
					onFilterChange={(value) => setQueryStates({ filter: value })}
					onCreatePost={handleCreatePost}
				/>

				<div className="p-4 space-y-4">
					{isError ? (
						<div className="text-center py-12">
							<div className="mb-4">
								<p className="text-destructive font-medium">Failed to load posts</p>
								<p className="text-muted-foreground text-sm mt-1">
									{error?.message || "Something went wrong. Please try again."}
								</p>
							</div>
							<Button variant="outline" onClick={() => refetch()}>
								Try Again
							</Button>
						</div>
					) : isLoadingPosts ? (
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
									onEdit={handleEditPost}
								/>
							))}
							
							{/* Infinite scroll trigger */}
							<LoadMoreTrigger
								hasNextPage={hasNextPage}
								isFetchingNextPage={isFetchingNextPage}
								fetchNextPage={fetchNextPage}
								autoLoad={true}
								error={error}
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
