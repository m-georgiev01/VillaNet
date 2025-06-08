import { cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditVilla } from "../../components/main/EditVilla";
import villaStore from "../../stores/villaStore";
import { screen } from "@testing-library/react";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ id: "5" }),
  };
});

describe("EditVilla component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders VillaMissing when no selectedVilla", () => {
    villaStore.getVillaById = vi.fn();

    render(
      <MemoryRouter>
        <EditVilla />
      </MemoryRouter>
    );

    expect(villaStore.getVillaById).toHaveBeenCalledWith(5);
    expect(screen.getByText("Villa not found")).toBeTruthy();
  });

  it("renders form when selectedVilla is set", async () => {
    villaStore.selectedVilla = {
      id: 5,
      name: "Old Name",
      pricePerNight: 100,
      description: "Old desc",
    } as any;

    render(
      <MemoryRouter>
        <EditVilla />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Name/) as HTMLInputElement;
    const priceInput = screen.getByLabelText(
      /Price per Night/
    ) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/) as HTMLInputElement;

    expect(nameInput.value).toBe("Old Name");
    expect(priceInput.value).toBe("100");
    expect(descInput.value).toBe("Old desc");
  });

  it("displays error alert when error is set", () => {
    villaStore.selectedVilla = {
      id: 5,
      name: "",
      pricePerNight: 0,
      description: "",
    } as any;
    villaStore.error = "Test error";

    render(
      <MemoryRouter>
        <EditVilla />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert").textContent).toBe("Test error");
  });

  it("updates fields and calls store setters on change", () => {
    villaStore.setSelectedVillaName = vi.fn();
    villaStore.setSelectedVillaPricePerNight = vi.fn();
    villaStore.setSelectedVillaDescription = vi.fn();
    villaStore.selectedVilla = {
      id: 5,
      name: "Name",
      pricePerNight: 50,
      description: "Desc",
    } as any;

    render(
      <MemoryRouter>
        <EditVilla />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "New Name" },
    });
    expect(villaStore.setSelectedVillaName).toHaveBeenCalledWith("New Name");

    fireEvent.change(screen.getByLabelText(/Price per Night/), {
      target: { value: "200" },
    });
    expect(villaStore.setSelectedVillaPricePerNight).toHaveBeenCalledWith(200);

    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: "New desc" },
    });
    expect(villaStore.setSelectedVillaDescription).toHaveBeenCalledWith(
      "New desc"
    );
  });
});
