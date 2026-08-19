"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addCommentAction, type AddCommentState } from "@/features/pokemon/actions/comment-actions";
import type { Comment } from "@/features/pokemon/types";

const initialState: AddCommentState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
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
        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
