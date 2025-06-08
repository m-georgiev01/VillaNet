import axios from "axios";
import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { ApiEndpointsUrl, type Villa } from "../../common/models";
import villaStore from "../../stores/villaStore";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("VillaStore", () => {
  const sampleVilla = {
    id: 5,
    name: "Test",
    description: "Desc",
    pricePerNight: 100,
  } as Villa;
  const pageResponse = { data: { items: [sampleVilla], totalCount: 42 } };

  beforeEach(() => {
    villaStore.villas = [];
    villaStore.loading = false;
    villaStore.error = null;
    villaStore.pageNumber = 1;
    villaStore.pageSize = 8;
    villaStore.totalCount = 0;
    villaStore.selectedVilla = undefined;
    villaStore.clearAddVillaRequest();
    villaStore.deletePopUpOpen = false;

    vi.clearAllMocks();
  });

  it("fetchAll loads villas on success", async () => {
    mockedAxios.get.mockResolvedValue(pageResponse);

    await villaStore.fetchAll(2, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/properties`,
      { params: { pageNumber: 2, pageSize: 10 } }
    );
    expect(villaStore.villas).toEqual([sampleVilla]);
    expect(villaStore.totalCount).toBe(42);
    expect(villaStore.pageNumber).toBe(2);
    expect(villaStore.pageSize).toBe(10);
    expect(villaStore.loading).toBe(false);
    expect(villaStore.error).toBeNull();
  });

  it("fetchAll sets error on failure", async () => {
    mockedAxios.get.mockRejectedValue({ message: "fail" });

    await villaStore.fetchAll();

    expect(villaStore.error).toBe("fail");
    expect(villaStore.loading).toBe(false);
  });

  it("getVillaById sets selectedVilla on success", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleVilla });

    await villaStore.getVillaById(5);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/properties/5`
    );
    expect(villaStore.selectedVilla).toEqual(sampleVilla);
    expect(villaStore.loading).toBe(false);
  });

  it("getVillaById sets error on failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: "err" } });

    await villaStore.getVillaById(6);

    expect(villaStore.error).toBe("err");
    expect(villaStore.loading).toBe(false);
  });

  it("updateVilla does nothing if no selectedVilla", async () => {
    villaStore.selectedVilla = undefined;

    await villaStore.updateVilla();

    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it("updateVilla updates villa on success", async () => {
    villaStore.selectedVilla = sampleVilla;
    mockedAxios.put.mockResolvedValue({ data: sampleVilla });

    await villaStore.updateVilla();

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/properties/5`,
      { name: "Test", description: "Desc", pricePerNight: 100 },
      { withCredentials: true }
    );
    expect(villaStore.selectedVilla).toEqual(sampleVilla);
    expect(villaStore.error).toBeNull();
    expect(villaStore.loading).toBe(false);
  });

  it("updateVilla sets error on failure", async () => {
    villaStore.selectedVilla = sampleVilla;
    mockedAxios.put.mockRejectedValue({ message: "oops" });

    await villaStore.updateVilla();

    expect(villaStore.error).toBe("oops");
    expect(villaStore.loading).toBe(false);
  });

  it("fetchVillasForOwner loads owner villas on success", async () => {
    mockedAxios.get.mockResolvedValue(pageResponse);

    await villaStore.fetchVillasForOwner(3, 7);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/properties/my`,
      { params: { pageNumber: 3, pageSize: 7 }, withCredentials: true }
    );
    expect(villaStore.villas).toEqual([sampleVilla]);
    expect(villaStore.totalCount).toBe(42);
    expect(villaStore.pageNumber).toBe(3);
    expect(villaStore.pageSize).toBe(7);
  });

  it("fetchVillasForOwner sets error on failure", async () => {
    mockedAxios.get.mockRejectedValue({ message: "bad" });
    await villaStore.fetchVillasForOwner();
    expect(villaStore.error).toBe("bad");
  });

  it("deleteVilla removes villa on success", async () => {
    villaStore.villas = [{ id: 9 } as any, { id: 10 } as any];
    mockedAxios.delete.mockResolvedValue({});

    await villaStore.deleteVilla(9);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/properties/9`,
      { withCredentials: true }
    );
    expect(villaStore.villas.map((v) => v.id)).toEqual([10]);
  });

  it("sets error on failure", async () => {
    villaStore.villas = [{ id: 11 } as any];
    mockedAxios.delete.mockRejectedValue({ response: { data: "err" } });

    await villaStore.deleteVilla(11);

    expect(villaStore.error).toBe("err");
    expect(villaStore.villas.map((v) => v.id)).toEqual([11]);
  });
});
