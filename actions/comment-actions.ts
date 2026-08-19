"use server";

import { revalidateTag } from "next/cache";
import { createComment } from "@/lib/api/comments";
import { commentFormSchema } from "@/lib/validation";
import type { Comment } from "@/lib/types";

export type AddCommentState = {
  status: "idle" | "success" | "error";
  message?: string;
  comment?: Comment;
};

export async function addCommentAction(
  _prevState: AddCommentState,
  formData: FormData,
): Promise<AddCommentState> {
  const parsed = commentFormSchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid comment",
    };
  }

  try {
    const comment = await createComment(parsed.data.body);
    revalidateTag("comments");
    return { status: "success", comment };
  } catch {
    return {
      status: "error",
      message: "Could not post the comment. Please try again.",
    };
  }
}
