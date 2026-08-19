"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addCommentAction, type AddCommentState } from "@/actions/comment-actions";
import type { Comment } from "@/lib/types";

const initialState: AddCommentState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Sending..." : "Comment"}
    </button>
  );
}

// Server Action + useFormState/useFormStatus: no manual useState needed for
// the "sending" status, and the <form action> works as a native POST if
// JS hasn't hydrated yet (progressive enhancement).
export function CommentForm({
  onSuccess,
}: Readonly<{
  onSuccess: (comment: Comment) => void;
}>) {
  const [state, formAction] = useFormState(addCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && state.comment) {
      onSuccess(state.comment);
      formRef.current?.reset();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="mt-6">
      <textarea
        name="body"
        className="border p-2 w-full"
        placeholder="Write a comment..."
        required
        maxLength={500}
        aria-label="New comment"
      />
      {state.status === "error" && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
