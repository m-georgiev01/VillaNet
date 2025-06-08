import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "../../components/main/Home";
import villaStore from "../../stores/villaStore";
import { screen } from "@testing-library/react";

describe("Home component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    villaStore.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("calls resetPagination and fetchAll on mount when no error", () => {
    villaStore.resetPagination = vi.fn();
    villaStore.fetchAll = vi.fn();

    render(<Home />);

    expect(villaStore.resetPagination).toHaveBeenCalledTimes(1);
    expect(villaStore.fetchAll).toHaveBeenCalledWith(1, 8);
  });

  it("renders error message when store.error is set", () => {
    villaStore.error = "Failed to load";

    render(<Home />);

    expect(screen.getByText("Failed to load")).toBeTruthy();
  });

  it("renders Pagination and handles page change", async () => {
    villaStore.fetchAll = vi.fn();
    villaStore.totalCount = 25;
    villaStore.pageSize = 10;
    villaStore.pageNumber = 1;

    render(<Home />);

    const page2Button = await screen.findByRole("button", {
      name: "Go to page 2",
    });
    expect(page2Button).toBeTruthy();

    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(villaStore.fetchAll).toHaveBeenCalledWith(2, 10);
    });
  });
});
