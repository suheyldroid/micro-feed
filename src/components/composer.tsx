"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Post, PostFormData } from "@/types";
import { useEffect, useState } from "react";

interface ComposerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: PostFormData) => void;
	editingPost?: Post;
	isLoading?: boolean;
}

export function Composer({
	open,
	onOpenChange,
	onSubmit,
	editingPost,
	isLoading = false,
}: ComposerProps) {
	const [content, setContent] = useState("");
	const isEditing = !!editingPost;
	const maxChars = 280;
	const remainingChars = maxChars - content.length;

	useEffect(() => {
		if (editingPost) {
			setContent(editingPost.content);
		} else {
			setContent("");
		}
	}, [editingPost]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (content.trim() && content.length <= maxChars) {
			onSubmit({ content: content.trim() });
			if (!isEditing) {
				setContent("");
			}
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		if (!isEditing) {
			setContent("");
		}
	};

	const isValid = content.trim().length > 0 && content.length <= maxChars;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Post" : "Create New Post"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Textarea
							placeholder="What's on your mind?"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="min-h-[120px] resize-none"
							maxLength={maxChars}
							autoFocus
						/>
						<div className="flex justify-between items-center text-sm">
							<span
								className={`${
									remainingChars < 20
										? remainingChars < 0
											? "text-red-500"
											: "text-orange-500"
										: "text-muted-foreground"
								}`}
							>
								{remainingChars} characters remaining
							</span>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!isValid || isLoading}>
							{isLoading
								? isEditing
									? "Updating..."
									: "Posting..."
								: isEditing
									? "Update"
									: "Post"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
