import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFound } from "../../components/main/NotFound";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("NotFound component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correct headings, message, and button", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeTruthy();
    expect(screen.getByText("Page Not Found")).toBeTruthy();
    expect(
      screen.getByText(
        "The page you're looking for doesn't exist or has been moved."
      )
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to Home" })).toBeTruthy();
  });

  it("navigates to home on button click", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to Home" }));
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});
