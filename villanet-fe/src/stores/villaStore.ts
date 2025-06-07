import { makeAutoObservable, runInAction } from "mobx";
import {
  ApiEndpointsUrl,
  type CreateVillaRequest,
  type UpdateVillaRequest,
  type Villa,
} from "../common/models";
import axios from "axios";
import locationStore from "./locationStore";

class VillaStore {
  villas: Villa[] = [];
  loading = false;
  error: string | null = null;
  pageNumber = 1;
  pageSize = 8;
  totalCount = 0;
  selectedVilla: Villa | undefined = undefined;
  createVillaRequest: CreateVillaRequest = this.initCreateVillaRequest();
  deletePopUpOpen: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAll(pageNumber: number = 1, pageSize: number = 10) {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.get(`${ApiEndpointsUrl}/properties`, {
        params: { pageNumber, pageSize },
      });

      runInAction(() => {
        this.villas = res.data.items;
        this.totalCount = res.data.totalCount;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async getVillaById(id: number) {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.get<Villa>(`${ApiEndpointsUrl}/properties/${id}`);
      runInAction(() => {
        this.selectedVilla = res.data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateVilla() {
    if (!this.selectedVilla) return;

    const updateRequest: UpdateVillaRequest = {
      name: this.selectedVilla.name,
      description: this.selectedVilla.description,
      pricePerNight: this.selectedVilla.pricePerNight,
    };

    this.loading = true;
    this.error = null;

    try {
      const res = await axios.put<Villa>(
        `${ApiEndpointsUrl}/properties/${this.selectedVilla.id}`,
        updateRequest,
        { withCredentials: true }
      );

      runInAction(() => {
        this.selectedVilla = res.data;
      });
    } catch (err: any) {
      console.error("Error updating villa:", err);
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchVillasForOwner(pageNumber: number = 1, pageSize: number = 10) {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.get(`${ApiEndpointsUrl}/properties/my`, {
        params: { pageNumber, pageSize },
        withCredentials: true,
      });
      runInAction(() => {
        this.villas = res.data.items;
        this.totalCount = res.data.totalCount;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || err.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setSelectedVillaName(name: string) {
    if (this.selectedVilla) {
      runInAction(() => {
        this.selectedVilla!.name = name;
      });
    }
  }

  setSelectedVillaPricePerNight(price: number) {
    if (this.selectedVilla) {
      runInAction(() => {
        this.selectedVilla!.pricePerNight = price;
      });
    }
  }

  setSelectedVillaDescription(description: string) {
    if (this.selectedVilla) {
      runInAction(() => {
        this.selectedVilla!.description = description;
      });
    }
  }

  clearAddVillaRequest() {
    runInAction(() => {
      this.createVillaRequest = this.initCreateVillaRequest();
    });
  }

  async createVilla() {
    if (!this.createVillaRequest) return;

    this.loading = true;
    this.error = null;

    try {
      const formData = new FormData();
      formData.append("Name", this.createVillaRequest.name);
      formData.append("Description", this.createVillaRequest.description);
      formData.append(
        "PricePerNight",
        String(this.createVillaRequest.pricePerNight)
      );
      formData.append("Location", this.createVillaRequest.location);
      formData.append("Capacity", String(this.createVillaRequest.capacity));
      formData.append("Image", this.createVillaRequest.image!);

      const res = await axios.post(`${ApiEndpointsUrl}/properties`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      runInAction(() => {
        this.villas.push(res.data);
        this.clearAddVillaRequest();
        locationStore.cleanup();
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || "Failed to create villa";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteVilla(id: number) {
    this.loading = true;
    this.error = null;
    try {
      await axios.delete(`${ApiEndpointsUrl}/properties/${id}`, {
        withCredentials: true,
      });

      runInAction(() => {
        this.villas = this.villas.filter((villa) => villa.id !== id);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || "Failed to delete villa";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  initCreateVillaRequest() {
    return (this.createVillaRequest = {
      name: "",
      description: "",
      pricePerNight: 0,
      location: "",
      capacity: 0,
      image: null,
    });
  }

  setCreateVillaName(name: string) {
    runInAction(() => {
      this.createVillaRequest.name = name;
    });
  }

  setCreateVillaPrice(price: number) {
    runInAction(() => {
      this.createVillaRequest.pricePerNight = price;
    });
  }

  setCreateVillaCapacity(capacity: number) {
    runInAction(() => {
      this.createVillaRequest.capacity = capacity;
    });
  }

  setCreateVillaDescription(description: string) {
    runInAction(() => {
      this.createVillaRequest.description = description;
    });
  }

  setCreateVillaLocation(location: string) {
    runInAction(() => {
      this.createVillaRequest.location = location;
    });
  }

  setCreateVillaImage(image: File) {
    runInAction(() => {
      this.createVillaRequest.image = image;
    });
  }

  openDeletePopUp() {
    runInAction(() => {
      this.deletePopUpOpen = true;
    });
  }

  closeDeletePopUp() {
    runInAction(() => {
      this.deletePopUpOpen = false;
    });
  }

  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  resetPagination() {
    runInAction(() => {
      this.pageNumber = 1;
      this.pageSize = 8;
      this.totalCount = 0;
    });
  }
}

export default new VillaStore();
