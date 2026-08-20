import { useEffect, useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentForm } from "./CommentForm";
import { addCommentAction } from "../../actions/comment-actions";

vi.mock("../../actions/comment-actions", () => ({
  addCommentAction: vi.fn(),
}));

// react-dom's stable npm release (18.3.1) doesn't ship useFormState /
// useFormStatus, and doesn't special-case a function `action` prop on
// <form> either — Next.js's own build only works because it bundles a
// patched React fork under the hood. Outside of Next's bundler (i.e. here,
// under plain Vitest), we provide a minimal, behavior-equivalent stand-in:
// a real "submit" listener that prevents the native (jsdom-unimplemented)
// submission and calls the action instead, so CommentForm's real logic —
// not just this polyfill — is what's actually being exercised.
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    useFormState: <State,>(
      action: (state: State, formData: FormData) => Promise<State>,
      initialState: State,
    ) => {
      const [state, setState] = useState(initialState);

      useEffect(() => {
        const handleSubmit = (event: SubmitEvent) => {
          event.preventDefault();
          const formData = new FormData(event.target as HTMLFormElement);
          void action(state, formData).then(setState);
        };
        document.addEventListener("submit", handleSubmit);
        return () => document.removeEventListener("submit", handleSubmit);
      });

      const dispatch = (formData: FormData) => {
        void action(state, formData).then(setState);
      };
      return [state, dispatch] as const;
    },
    useFormStatus: () => ({ pending: false }),
  };
});

describe("CommentForm", () => {
  it("calls onSuccess with the new comment and resets the form", async () => {
    const comment = {
      postId: 1,
      id: 1,
      name: "Anonymous trainer",
      email: "anonymous@example.com",
      body: "Nice catch!",
    };
    vi.mocked(addCommentAction).mockResolvedValue({
      status: "success",
      comment,
    });
    const onSuccess = vi.fn();

    render(<CommentForm onSuccess={onSuccess} />);
    const textarea = screen.getByLabelText("New comment");
    await userEvent.type(textarea, "Nice catch!");
    await userEvent.click(screen.getByRole("button", { name: "Comment" }));

    await screen.findByRole("button", { name: "Comment" });
    expect(onSuccess).toHaveBeenCalledWith(comment);
  });

  it("shows the error message when the action fails", async () => {
    vi.mocked(addCommentAction).mockResolvedValue({
      status: "error",
      message: "Something went wrong server-side",
    });

    render(<CommentForm onSuccess={vi.fn()} />);
    // The textarea is required, so the browser (and jsdom) blocks
    // submission entirely for an empty value before the action ever runs —
    // type something valid to reach the "action rejected it" path.
    await userEvent.type(screen.getByLabelText("New comment"), "Nice catch!");
    await userEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong server-side",
    );
  });
});
