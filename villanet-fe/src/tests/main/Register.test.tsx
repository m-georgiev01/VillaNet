import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Register } from "../../components/main/Register";
import authStore from "../../stores/authStore";

describe("Register component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form fields and role options", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/)).toBeTruthy();
    expect(screen.getByLabelText(/Username/)).toBeTruthy();
    expect(screen.getByLabelText(/Password/)).toBeTruthy();
    expect(screen.getByLabelText(/Role/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();
  });

  it("updates authStore fields on input change", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "e@test.com" },
    });
    expect(authStore.email).toBe("e@test.com");

    fireEvent.change(screen.getByLabelText(/Username/), {
      target: { value: "user1" },
    });
    expect(authStore.username).toBe("user1");

    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: "pass123" },
    });
    expect(authStore.password).toBe("pass123");
  });

  it("displays error alert when authStore.error is set", () => {
    authStore.error = "Registration failed";

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert").textContent).toBe("Registration failed");
  });

  it("shows loading spinner based on authStore.loading", () => {
    authStore.loading = true;

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });

  it("calls authStore.register on successful registration", async () => {
    authStore.email = "a@b.com";
    authStore.username = "user";
    authStore.password = "pwd";
    authStore.roleId = 1;
    authStore.register = vi.fn();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(authStore.register).toHaveBeenCalledWith(
      "a@b.com",
      "user",
      "pwd",
      1
    );
  });
});
