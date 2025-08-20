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
import { useAuth } from "@/contexts/auth-context";
import { useMutatePost } from "@/hooks/use-mutate-post";
import { postSchema } from "@/lib/validations";
import type { Post, PostFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface ComposerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingPost?: Post;
}

export function Composer({
	open,
	onOpenChange,
	editingPost,
}: ComposerProps) {
	const { user } = useAuth();
	const { createPost, updatePost, isCreating, isUpdating } = useMutatePost({
		onSuccess: () => {
			onOpenChange(false);
			form.reset();
		},
	});

	const isEditing = !!editingPost;
	const maxChars = 280;

	const form = useForm<PostFormData>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			content: "",
		},
	});

	const content = form.watch("content");
	const remainingChars = maxChars - content.length;

	useEffect(() => {
		if (editingPost) {
			form.setValue("content", editingPost.content);
		} else {
			form.reset({ content: "" });
		}
	}, [editingPost, form]);

	const handleSubmit = async (data: PostFormData) => {
		if (!user) return;

		if (editingPost) {
			updatePost({ postId: editingPost.id, data });
		} else {
			createPost(data);
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		form.reset();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Post" : "Create New Post"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Textarea
							placeholder="What's on your mind?"
							{...form.register("content")}
							className="min-h-[120px] resize-none"
							maxLength={maxChars}
							autoFocus
						/>
						{form.formState.errors.content && (
							<p className="text-sm text-red-500">
								{form.formState.errors.content.message}
							</p>
						)}
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
							disabled={isCreating || isUpdating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!form.formState.isValid || isCreating || isUpdating}
						>
							{isCreating || isUpdating
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
