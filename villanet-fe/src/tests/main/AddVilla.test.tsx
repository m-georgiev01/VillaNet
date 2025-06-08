import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import villaStore from "../../stores/villaStore";
import locationStore from "../../stores/locationStore";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AddVilla } from "../../components/main/AddVilla";
import { screen, fireEvent, waitFor } from "@testing-library/react";

describe("AddVilla component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders form fields and initial state", () => {
    render(
      <MemoryRouter>
        <AddVilla />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Name/)).toBeTruthy();
    expect(screen.getByLabelText(/Price per Night/)).toBeTruthy();
    expect(screen.getByLabelText(/Capacity/)).toBeTruthy();
    expect(screen.getByLabelText(/Location/)).toBeTruthy();
    expect(screen.getByLabelText(/Description/)).toBeTruthy();
    expect(screen.getByText(/No image uploaded/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  });

  it("displays error alert when villaStore.error is set", () => {
    villaStore.error = "Test error";
    render(
      <MemoryRouter>
        <AddVilla />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert").textContent).toBe("Test error");
  });

  it("shows location suggestions and allows selection", async () => {
    locationStore.selectSuggestion = vi.fn();
    villaStore.setCreateVillaLocation = vi.fn();

    locationStore.suggestions = [
      { display_name: "Paris, France" },
      { display_name: "Paris, TX" },
    ] as any;

    render(
      <MemoryRouter>
        <AddVilla />
      </MemoryRouter>
    );

    expect(screen.getByText("Paris, France")).toBeTruthy();
    expect(screen.getByText("Paris, TX")).toBeTruthy();

    fireEvent.click(screen.getByText("Paris, TX"));

    await waitFor(() => {
      expect(locationStore.selectSuggestion).toHaveBeenCalledWith(
        locationStore.suggestions[1]
      );
      expect(villaStore.setCreateVillaLocation).toHaveBeenCalledWith(
        "Paris, TX"
      );
    });
  });

  it("updates image upload state", () => {
    villaStore.setCreateVillaImage = vi.fn();
    render(
      <MemoryRouter>
        <AddVilla />
      </MemoryRouter>
    );

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const input = screen.getByLabelText(/Upload Image/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(villaStore.setCreateVillaImage).toHaveBeenCalledWith(file);
  });

  it("displays loading spinner based on villaStore.loading", () => {
    villaStore.loading = true;
    render(
      <MemoryRouter>
        <AddVilla />
      </MemoryRouter>
    );

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
  });
});
