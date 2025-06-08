import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import villaStore from "../../stores/villaStore";
import reservationStore from "../../stores/reservationStore";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { VillaDetails } from "../../components/main/VillaDetails";
import authStore from "../../stores/authStore";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ id: "5" }),
    useNavigate: () => mockNavigate,
  };
});

describe("VillaDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    villaStore.error = null;
    reservationStore.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("shows VillaMissing when selectedVilla is undefined", async () => {
    villaStore.selectedVilla = undefined;

    render(
      <MemoryRouter>
        <VillaDetails />
      </MemoryRouter>
    );

    expect(screen.getByText("Villa not found")).toBeTruthy();
  });

  it("renders villa info and customer reserve flow", async () => {
    villaStore.selectedVilla = {
      id: 7,
      name: "Beach House",
      image: "img.jpg",
      pricePerNight: 200,
      capacity: 5,
      location: "Beach",
      description: "Sunny",
      ownerId: 9,
    };
    authStore.user = { role: "Customer" } as any;

    render(
      <MemoryRouter>
        <VillaDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Beach House/)).toBeTruthy();
    const reserveBtn = screen.getByRole("button", { name: "Reserve" });
    expect(reserveBtn.hasAttribute("disabled")).toBeTruthy();
  });

  it("renders owner actions", () => {
    villaStore.selectedVilla = {
      id: 5,
      name: "Villa",
      ownerId: 3,
      pricePerNight: 1,
    } as any;
    authStore.user = { userId: 3, role: "Owner" } as any;
    reservationStore.reservations = [
      {
        id: 1,
        propertyId: 5,
        propertyName: "PropName",
        totalNights: 1,
        totalPrice: 100,
        startDate: "11/11/2025",
        endDate: "12/11/2025",
      },
    ];
    reservationStore.totalCount = 1;
    villaStore.getVillaById = vi.fn();
    villaStore.openDeletePopUp = vi.fn();

    render(
      <MemoryRouter>
        <VillaDetails />
      </MemoryRouter>
    );

    const editBtn = screen.getByRole("button", { name: "Edit" });
    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(editBtn).toBeTruthy();
    expect(deleteBtn).toBeTruthy();

    fireEvent.click(editBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/villas/5/edit");

    fireEvent.click(deleteBtn);
    expect(villaStore.openDeletePopUp).toHaveBeenCalled();
  });
});
