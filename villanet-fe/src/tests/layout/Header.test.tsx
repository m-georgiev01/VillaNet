import { beforeEach, describe, expect, it, vi } from "vitest";
import authStore from "../../stores/authStore";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Header } from "../../components/layout/Header";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await import("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("Header component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders Login and Register when not authenticated", () => {
    authStore.user = null;
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeTruthy();
    expect(screen.getByText("Register")).toBeTruthy();
    expect(screen.queryByText("Logout")).toBeNull();
  });

  it("renders owner links when authenticated as owner", () => {
    authStore.user = { role: "Owner" } as any;

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Add Villa")).toBeTruthy();
    expect(screen.getByText("Own Villas")).toBeTruthy();
    expect(screen.getByText("Logout")).toBeTruthy();
    expect(screen.queryByText("Login")).toBeNull();
  });

  it("renders customer link when authenticated as customer", () => {
    authStore.user = { role: "Customer" } as any;

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("My Reservations")).toBeTruthy();
    expect(screen.getByText("Logout")).toBeTruthy();
    expect(screen.queryByText("Add Villa")).toBeNull();
  });

  it("calls authStore.logout with navigate on logout click", () => {
    authStore.user = { role: "Owner" } as any;
    authStore.logout = vi.fn();

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Logout"));

    expect(authStore.logout).toHaveBeenCalledWith(mockedNavigate);
  });
});
