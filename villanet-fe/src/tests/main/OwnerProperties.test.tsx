import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OwnerProperties } from "../../components/main/OwnerProperties";
import villaStore from "../../stores/villaStore";

describe("OwnerProperties component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    villaStore.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("calls resetPagination and fetchVillasForOwner on mount when no error", () => {
    villaStore.resetPagination = vi.fn();
    villaStore.fetchVillasForOwner = vi.fn();

    render(
      <MemoryRouter>
        <OwnerProperties />
      </MemoryRouter>
    );

    expect(villaStore.resetPagination).toHaveBeenCalledTimes(1);
    expect(villaStore.fetchVillasForOwner).toHaveBeenCalledWith(1, 8);
  });

  it("renders error message when error is set", () => {
    villaStore.error = "Fetch failed";

    render(
      <MemoryRouter>
        <OwnerProperties />
      </MemoryRouter>
    );

    expect(screen.getByText("Fetch failed")).toBeTruthy();
    expect(screen.queryByTestId("villa-container")).toBeNull();
  });

  it("renders no villas message when villas array is empty and no error", () => {
    villaStore.villas = [];

    render(
      <MemoryRouter>
        <OwnerProperties />
      </MemoryRouter>
    );

    expect(screen.getByText("You have no villas listed.")).toBeTruthy();
  });

  it("renders VillaContainer", () => {
    villaStore.villas = [
      {
        id: 1,
        name: "Name",
        location: "loc",
        capacity: 1,
        description: "desc",
        image: "img",
        pricePerNight: 110,
        ownerId: 11,
      },
    ];
    villaStore.totalCount = 25;
    villaStore.pageSize = 10;
    villaStore.pageNumber = 2;

    render(
      <MemoryRouter>
        <OwnerProperties />
      </MemoryRouter>
    );

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("loc")).toBeTruthy();
  });

  it("renders Pagination and handles page change", async () => {
    villaStore.fetchVillasForOwner = vi.fn();
    villaStore.villas = [
      {
        id: 1,
        name: "Name",
        location: "loc",
        capacity: 1,
        description: "desc",
        image: "img",
        pricePerNight: 110,
        ownerId: 11,
      },
    ];
    villaStore.totalCount = 25;
    villaStore.pageSize = 10;
    villaStore.pageNumber = 1;

    render(
      <MemoryRouter>
        <OwnerProperties />
      </MemoryRouter>
    );

    const page2Button = await screen.findByRole("button", {
      name: "Go to page 2",
    });
    expect(page2Button).toBeTruthy();

    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(villaStore.fetchVillasForOwner).toHaveBeenCalled();
    });
  });
});
