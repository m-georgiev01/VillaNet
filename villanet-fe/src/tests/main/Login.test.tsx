import { cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Login } from "../../components/main/Login";
import { screen } from "@testing-library/react";
import authStore from "../../stores/authStore";

describe("Login component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form fields, button, and loading spinner", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/)).toBeTruthy();
    expect(screen.getByLabelText(/Password/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("displays error alert when authStore.error is set", () => {
    authStore.error = "Invalid credentials";

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert").textContent).toBe("Invalid credentials");
  });

  it("updates authStore.email and authStore.password on input change", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: "user@test.com" },
    });
    expect(authStore.email).toBe("user@test.com");

    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: "secret" },
    });
    expect(authStore.password).toBe("secret");
  });

  it("shows loading spinner when authStore.loading is true", () => {
    authStore.loading = true;

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });

  it("calls authStore.login with email and password on submit", async () => {
    authStore.email = "u@e.com";
    authStore.password = "pw";
    authStore.login = vi.fn();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(authStore.login).toHaveBeenCalledWith("u@e.com", "pw");
  });
});
