"use client";

import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { Toolbar } from "@/components/toolbar";
import { useAuth } from "@/contexts/auth-context";
import { mockPosts } from "@/data/mock";
import type { FilterType, Post, PostFormData } from "@/types";
import { useMemo, useState } from "react";

export function Feed() {
	const { user } = useAuth();
	const [posts, setPosts] = useState<Post[]>(mockPosts);
	const [searchValue, setSearchValue] = useState("");
	const [filter, setFilter] = useState<FilterType>("all");
	const [composerOpen, setComposerOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | undefined>();
	const [loadingStates, setLoadingStates] = useState<{
		composer: boolean;
		likes: Record<string, boolean>;
	}>({
		composer: false,
		likes: {},
	});

	// Filter and search posts
	const filteredPosts = useMemo(() => {
		if (!user) return [];
		let filtered = posts;

		// Apply filter
		if (filter === "mine") {
			filtered = filtered.filter((post) => post.authorId === user.id);
		} else if (filter === "liked") {
			filtered = filtered.filter((post) => post.likes.includes(user.id));
		}

		// Apply search
		if (searchValue.trim()) {
			const searchTerm = searchValue.toLowerCase();
			filtered = filtered.filter(
				(post) =>
					post.content.toLowerCase().includes(searchTerm) ||
					post.authorName.toLowerCase().includes(searchTerm) ||
					post.authorUsername.toLowerCase().includes(searchTerm),
			);
		}

		// Sort by creation date (newest first)
		return filtered.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
	}, [posts, filter, searchValue, user]);

	const handleCreatePost = () => {
		setEditingPost(undefined);
		setComposerOpen(true);
	};

	const handleEditPost = (post: Post) => {
		setEditingPost(post);
		setComposerOpen(true);
	};

	const handleSubmitPost = async (data: PostFormData) => {
		setLoadingStates((prev) => ({ ...prev, composer: true }));

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		if (editingPost) {
			// Update existing post
			setPosts((prev) =>
				prev.map((post) =>
					post.id === editingPost.id
						? { ...post, content: data.content, updatedAt: new Date() }
						: post,
				),
			);
		} else {
			// Create new post
			const newPost: Post = {
				id: `post-${Date.now()}`,
				content: data.content,
				authorId: user.id,
				authorName: user.name,
				authorUsername: user.username,
				createdAt: new Date(),
				updatedAt: new Date(),
				likes: [],
			};
			setPosts((prev) => [newPost, ...prev]);
		}

		setLoadingStates((prev) => ({ ...prev, composer: false }));
		setComposerOpen(false);
		setEditingPost(undefined);
	};

	const handleLikePost = async (postId: string) => {
		setLoadingStates((prev) => ({
			...prev,
			likes: { ...prev.likes, [postId]: true },
		}));

		// Optimistic update
		setPosts((prev) =>
			prev.map((post) =>
				post.id === postId
					? { ...post, likes: [...post.likes, user.id] }
					: post,
			),
		);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		setLoadingStates((prev) => ({
			...prev,
			likes: { ...prev.likes, [postId]: false },
		}));
	};

	const handleUnlikePost = async (postId: string) => {
		setLoadingStates((prev) => ({
			...prev,
			likes: { ...prev.likes, [postId]: true },
		}));

		// Optimistic update
		setPosts((prev) =>
			prev.map((post) =>
				post.id === postId
					? { ...post, likes: post.likes.filter((id) => id !== user.id) }
					: post,
			),
		);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		setLoadingStates((prev) => ({
			...prev,
			likes: { ...prev.likes, [postId]: false },
		}));
	};

	const handleDeletePost = async (postId: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		setPosts((prev) => prev.filter((post) => post.id !== postId));
	};

	if (!user) {
		return null; // This shouldn't happen as Feed is only rendered when authenticated
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-2xl mx-auto">
				<Toolbar
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					filter={filter}
					onFilterChange={setFilter}
					onCreatePost={handleCreatePost}
				/>

				<div className="p-4 space-y-4">
					{filteredPosts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								{searchValue
									? "No posts found matching your search."
									: filter === "mine"
										? "You haven't created any posts yet."
										: filter === "liked"
											? "You haven't liked any posts yet."
											: "No posts yet. Create the first one!"}
							</p>
						</div>
					) : (
						filteredPosts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								currentUserId={user.id}
								onLike={handleLikePost}
								onUnlike={handleUnlikePost}
								onEdit={handleEditPost}
								onDelete={handleDeletePost}
								isLikeLoading={loadingStates.likes[post.id]}
							/>
						))
					)}
				</div>
			</div>

			<Composer
				open={composerOpen}
				onOpenChange={setComposerOpen}
				onSubmit={handleSubmitPost}
				editingPost={editingPost}
				isLoading={loadingStates.composer}
			/>
		</div>
	);
}
