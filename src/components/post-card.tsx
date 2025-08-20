"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useLike } from "@/hooks/use-like";
import { useMutatePost } from "@/hooks/use-mutate-post";
import { deletePostAction } from "@/lib/actions/posts";
import type { PostExtended } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Edit, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
	post: PostExtended;
}

export function PostCard({ post }: PostCardProps) {
	const { user } = useAuth();
	const { toggleLike, isLoading: isLikeLoading } = useLike();
	const { deletePost: mutateDeletePost } = useMutatePost({});

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isOwner = post.author_id === user?.id;
	const isLiked = post.isLiked;
	const likeCount = post.likes.length;

	const handleLikeClick = () => {
		toggleLike(post);
	};

	const handleEdit = () => {
		// This will be handled by parent component
		// We could emit an event or use a global state
		console.log("Edit post:", post.id);
	};

	const handleDelete = async () => {
		try {
			const result = await deletePostAction(post.id);
			if (result.success) {
				mutateDeletePost(post.id);
			} else {
				console.error("Error deleting post:", result.error);
			}
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	return (
		<>
			<Card className="w-full">
				<CardContent className="p-4">
					<div className="space-y-3">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-semibold">@{post.author.username}</span>
								</div>
								<span className="text-muted-foreground text-sm">
									{post.created_at &&
										formatDistanceToNow(new Date(post.created_at), {
											addSuffix: true,
										})}
									{post.created_at &&
										post.updated_at &&
										new Date(post.updated_at) > new Date(post.created_at) &&
										" (edited)"}
								</span>
							</div>

							{/* Owner Menu */}
							{isOwner && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={handleEdit}>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setShowDeleteConfirm(true)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>

						{/* Content */}
						<div className="text-sm leading-relaxed whitespace-pre-wrap">
							{post.content}
						</div>

						{/* Actions */}
						<div className="flex justify-end">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLikeClick}
								disabled={isLikeLoading}
								className={`flex items-center gap-2 ${
									isLiked ? "text-red-500 hover:text-red-600" : ""
								}`}
							>
								<Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
								{likeCount > 0 && <span className="text-sm">{likeCount}</span>}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={showDeleteConfirm}
				onOpenChange={setShowDeleteConfirm}
				title="Delete Post"
				description="Are you sure you want to delete this post? This action cannot be undone."
				onConfirm={handleDelete}
				confirmText="Delete"
				variant="destructive"
			/>
		</>
	);
}
