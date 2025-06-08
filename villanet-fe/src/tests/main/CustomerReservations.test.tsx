import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerReservations } from "../../components/main/CustomerReservartions";
import reservationStore from "../../stores/reservationStore";
import { screen, fireEvent, waitFor } from "@testing-library/react";

describe("CustomerReservations component", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls restorePagination and getReservationsForCustomer on mount", () => {
    reservationStore.restorePagination = vi.fn();
    reservationStore.getReservationsForCustomer = vi.fn();

    render(
      <MemoryRouter>
        <CustomerReservations />
      </MemoryRouter>
    );

    expect(reservationStore.restorePagination).toHaveBeenCalledTimes(1);
    expect(reservationStore.getReservationsForCustomer).toHaveBeenCalledTimes(
      1
    );
  });

  it("does not render Pagination when totalCount is zero", () => {
    reservationStore.totalCount = 0;

    render(
      <MemoryRouter>
        <CustomerReservations />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("pagination")).toBeNull();
    expect(screen.getByText("No reservations found.")).toBeTruthy();
  });

  it("renders Pagination and handles page change", async () => {
    reservationStore.getReservationsForCustomer = vi.fn();
    reservationStore.totalCount = 25;
    reservationStore.pageSize = 10;
    reservationStore.pageNumber = 1;

    render(
      <MemoryRouter>
        <CustomerReservations />
      </MemoryRouter>
    );

    const page2Button = await screen.findByRole("button", {
      name: "Go to page 2",
    });
    expect(page2Button).toBeTruthy();

    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(reservationStore.getReservationsForCustomer).toHaveBeenCalledWith(
        2,
        reservationStore.pageSize
      );
    });
  });
});
