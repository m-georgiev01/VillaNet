import axios from "axios";
import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import locationStore from "../../stores/locationStore";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("LocationStore", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("setQuery clears suggestions when query length <= 2", () => {
    locationStore.suggestions = [{ display_name: "X", lat: "0", lon: "0" }];

    locationStore.setQuery("hi");

    expect(locationStore.suggestions).toEqual([]);
  });

  it("setQuery schedules searchLocation after debounce when length > 2", () => {
    vi.useFakeTimers();
    locationStore.setQuery("abc");

    expect(locationStore.searchTimeout).not.toBeNull();

    expect(mockedAxios.get).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://nominatim.openstreetmap.org/search",
      { params: { q: "abc", format: "json", addressdetails: 1 } }
    );
  });

  it("cleanup resets state and clears pending timeout", () => {
    vi.useFakeTimers();
    locationStore.setQuery("xyz");
    expect(locationStore.searchTimeout).not.toBeNull();

    locationStore.suggestions = [{ display_name: "X", lat: "0", lon: "0" }];
    locationStore.query = "query";
    locationStore.cleanup();

    expect(locationStore.query).toBe("");
    expect(locationStore.suggestions).toEqual([]);
    expect(locationStore.searchTimeout).toBeNull();
  });
});
