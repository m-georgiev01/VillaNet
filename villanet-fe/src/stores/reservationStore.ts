import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import {
  ApiEndpointsUrl,
  formatDateForBackend,
  MINIMUM_DAYS_BEFORE_CANCELLATION,
  type Reservation,
} from "../common/models";

class ReservationStore {
  startDate: Date | null = null;
  endDate: Date | null = null;
  totalPrice: number = 0;
  reservationErrorPopUpOpen: boolean = false;
  error: string | null = null;
  reservations: Reservation[] = [];
  pageNumber = 1;
  pageSize = 5;
  totalCount = 0;
  deletePopUpOpen: boolean = false;
  reservationIdToDelete: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async reserveVilla(villaId: number, startDate: Date, endDate: Date) {
    this.error = null;
    try {
      await axios.post(
        `${ApiEndpointsUrl}/reservations`,
        {
          propertyId: villaId,
          startDate: formatDateForBackend(startDate),
          endDate: formatDateForBackend(endDate),
        },
        { withCredentials: true }
      );
      runInAction(() => {
        this.startDate = null;
        this.endDate = null;
        this.totalPrice = 0;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
        this.openReservationErrorPopUp();
      });
    }
  }

  async getReservationsForCustomer(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.error = null;
    try {
      const response = await axios.get(`${ApiEndpointsUrl}/reservations`, {
        params: { pageNumber, pageSize },
        withCredentials: true,
      });
      runInAction(() => {
        this.reservations = response.data.items;
        this.totalCount = response.data.totalCount;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    }
  }

  async getReservationsForVilla(
    villaId: number,
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.error = null;
    try {
      const response = await axios.get(
        `${ApiEndpointsUrl}/reservations/${villaId}`,
        {
          params: { pageNumber, pageSize },
          withCredentials: true,
        }
      );
      runInAction(() => {
        this.reservations = response.data.items;

        this.totalCount = response.data.totalCount;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    }
  }

  async cancelReservation(reservationId: number) {
    this.error = null;
    try {
      await axios.delete(`${ApiEndpointsUrl}/reservations/${reservationId}`, {
        withCredentials: true,
      });
      runInAction(() => {
        this.reservations = this.reservations.filter(
          (r) => r.id !== reservationId
        );
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    }
  }

  possibleToCancel(startDate: Date | null) {
    if (!startDate) return false;

    const now = new Date();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const timeDiff = start.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff < MINIMUM_DAYS_BEFORE_CANCELLATION;
  }

  setStartDate(date: Date | null) {
    runInAction(() => {
      this.startDate = date;
      this.endDate = null;
    });
  }

  setEndDate(date: Date | null, pricePerDay: number) {
    runInAction(() => {
      this.endDate = date;
      if (this.startDate && this.endDate) {
        this.calculateTotalPrice(pricePerDay);
      }
    });
  }

  calculateTotalPrice(pricePerDay: number) {
    if (this.startDate && this.endDate) {
      const start = this.startDate.getTime();
      const end = this.endDate.getTime();
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      this.totalPrice = days * pricePerDay;
    } else {
      this.totalPrice = 0;
    }
  }

  openReservationErrorPopUp() {
    runInAction(() => {
      this.reservationErrorPopUpOpen = true;
    });
  }

  closeReservationErrorPopUp() {
    runInAction(() => {
      this.reservationErrorPopUpOpen = false;
    });
  }

  restorePagination() {
    runInAction(() => {
      this.pageNumber = 1;
      this.pageSize = 5;
      this.totalCount = 0;
    });
  }

  openDeletePopUp(reservationId: number) {
    runInAction(() => {
      this.deletePopUpOpen = true;
      this.reservationIdToDelete = reservationId;
    });
  }

  closeDeletePopUp() {
    runInAction(() => {
      this.deletePopUpOpen = false;
      this.reservationIdToDelete = null;
    });
  }

  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }
}

export default new ReservationStore();
