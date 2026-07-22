// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/components/auth-form";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));

describe("AuthForm", () => {
  beforeEach(() => replace.mockReset());

  it("blocks registration when password confirmation differs", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Email address"), "investor@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "a secure password");
    await user.type(screen.getByLabelText("Confirm password"), "a different password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(replace).not.toHaveBeenCalled();
  });
});
