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
import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Edit, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
	post: Post;
	currentUserId: string;
	onLike: (postId: string) => void;
	onUnlike: (postId: string) => void;
	onEdit: (post: Post) => void;
	onDelete: (postId: string) => void;
	isLikeLoading?: boolean;
}

export function PostCard({
	post,
	currentUserId,
	onLike,
	onUnlike,
	onEdit,
	onDelete,
	isLikeLoading = false,
}: PostCardProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isOwner = post.authorId === currentUserId;
	const isLiked = post.likes.includes(currentUserId);
	const likeCount = post.likes.length;

	const handleLikeToggle = () => {
		if (isLiked) {
			onUnlike(post.id);
		} else {
			onLike(post.id);
		}
	};

	const handleEdit = () => {
		onEdit(post);
	};

	const handleDelete = () => {
		onDelete(post.id);
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
									<span className="font-semibold">{post.authorName}</span>
									<span className="text-muted-foreground text-sm">
										@{post.authorUsername}
									</span>
								</div>
								<span className="text-muted-foreground text-sm">
									{formatDistanceToNow(post.createdAt, { addSuffix: true })}
									{post.updatedAt > post.createdAt && " (edited)"}
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
								onClick={handleLikeToggle}
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
