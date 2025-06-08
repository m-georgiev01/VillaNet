import axios from "axios";
import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import reservationStore from "../../stores/reservationStore";
import {
  ApiEndpointsUrl,
  formatDateForBackend,
  type Reservation,
} from "../../common/models";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("ReservationStore", () => {
  beforeEach(() => {
    reservationStore.startDate = null;
    reservationStore.endDate = null;
    reservationStore.totalPrice = 0;
    reservationStore.reservationErrorPopUpOpen = false;
    reservationStore.error = null;
    reservationStore.reservations = [];
    reservationStore.pageNumber = 1;
    reservationStore.pageSize = 5;
    reservationStore.totalCount = 0;
    reservationStore.deletePopUpOpen = false;
    reservationStore.reservationIdToDelete = null;

    vi.clearAllMocks();
  });

  it("reserveVilla clears dates and price on success", async () => {
    mockedAxios.post.mockResolvedValue({});

    const start = new Date(2025, 5, 1);
    const end = new Date(2025, 5, 4);
    reservationStore.startDate = start;
    reservationStore.endDate = end;
    reservationStore.totalPrice = 999;

    await reservationStore.reserveVilla(10, start, end);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/reservations`,
      {
        propertyId: 10,
        startDate: formatDateForBackend(start),
        endDate: formatDateForBackend(end),
      },
      { withCredentials: true }
    );
    expect(reservationStore.startDate).toBeNull();
    expect(reservationStore.endDate).toBeNull();
    expect(reservationStore.totalPrice).toBe(0);
    expect(reservationStore.error).toBeNull();
    expect(reservationStore.reservationErrorPopUpOpen).toBe(false);
  });

  it("reserveVilla sets error and opens error popup on failure", async () => {
    const err = { response: { data: "Err" } };
    mockedAxios.post.mockRejectedValue(err);
    const start = new Date(2025, 5, 1);
    const end = new Date(2025, 5, 2);

    await reservationStore.reserveVilla(20, start, end);

    expect(reservationStore.error).toBe("Err");
    expect(reservationStore.reservationErrorPopUpOpen).toBe(true);
  });

  it("getReservationsForCustomer populates reservations and pagination on success", async () => {
    const items: Reservation[] = [
      {
        id: 1,
        propertyId: 1,
        propertyName: "A",
        startDate: "2025-06-01",
        endDate: "2025-06-02",
        totalNights: 1,
        totalPrice: 100,
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: { items, totalCount: 42 } });

    await reservationStore.getReservationsForCustomer(2, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/reservations`,
      { params: { pageNumber: 2, pageSize: 10 }, withCredentials: true }
    );
    expect(reservationStore.reservations).toEqual(items);
    expect(reservationStore.totalCount).toBe(42);
    expect(reservationStore.pageNumber).toBe(2);
    expect(reservationStore.pageSize).toBe(10);
    expect(reservationStore.error).toBeNull();
  });

  it("getReservationsForCustomer sets error on failure", async () => {
    mockedAxios.get.mockRejectedValue({ message: "Fail" });

    await reservationStore.getReservationsForCustomer();

    expect(reservationStore.error).toBe("Fail");
  });

  it("getReservationsForVilla populates reservations and pagination on success", async () => {
    const items: Reservation[] = [
      {
        id: 2,
        propertyId: 5,
        propertyName: "B",
        startDate: "2025-07-01",
        endDate: "2025-07-03",
        totalNights: 2,
        totalPrice: 200,
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: { items, totalCount: 7 } });

    await reservationStore.getReservationsForVilla(5, 3, 15);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/reservations/5`,
      { params: { pageNumber: 3, pageSize: 15 }, withCredentials: true }
    );
    expect(reservationStore.reservations).toEqual(items);
    expect(reservationStore.totalCount).toBe(7);
    expect(reservationStore.pageNumber).toBe(3);
    expect(reservationStore.pageSize).toBe(15);
  });

  it("getReservationsForVilla sets error on failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: "Err" } });

    await reservationStore.getReservationsForVilla(9);

    expect(reservationStore.error).toBe("Err");
  });

  it("cancelReservation removes reservation on success", async () => {
    reservationStore.reservations = [{ id: 10 } as any, { id: 11 } as any];
    mockedAxios.delete.mockResolvedValue({});

    await reservationStore.cancelReservation(10);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/reservations/10`,
      { withCredentials: true }
    );
    expect(reservationStore.reservations.map((r) => r.id)).toEqual([11]);
  });

  it("cancelReservation sets error on failure and does not remove", async () => {
    reservationStore.reservations = [{ id: 20 } as any];
    mockedAxios.delete.mockRejectedValue({ message: "Err" });

    await reservationStore.cancelReservation(20);
    expect(reservationStore.error).toBe("Err");
    expect(reservationStore.reservations.map((r) => r.id)).toEqual([20]);
  });

  it("setStartDate resets endDate", () => {
    reservationStore.endDate = new Date();
    reservationStore.setStartDate(new Date(2025, 0, 1));
    expect(reservationStore.startDate).not.toBeNull();
    expect(reservationStore.endDate).toBeNull();
  });

  it("setEndDate sets endDate and calculates price", () => {
    const start = new Date(2025, 0, 1);
    reservationStore.startDate = start;
    reservationStore.setEndDate(new Date(2025, 0, 4), 100);
    expect(reservationStore.endDate).not.toBeNull();
    expect(reservationStore.totalPrice).toBe(300);
  });

  it("calculateTotalPrice sets price to 0 if dates missing", () => {
    reservationStore.startDate = null;
    reservationStore.endDate = null;
    reservationStore.calculateTotalPrice(200);
    expect(reservationStore.totalPrice).toBe(0);
  });
});
