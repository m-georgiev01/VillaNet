import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import authStore, { type IUser } from "../../stores/authStore";
import axios from "axios";
import { ApiEndpointsUrl } from "../../common/models";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

describe("AuthStore", () => {
  const testUser = {
    username: "u",
    email: "e",
    role: "Admin",
    userId: 1,
  } as IUser;
  const navigateMock = vi.fn();

  beforeEach(() => {
    authStore.user = null;
    authStore.loading = false;
    authStore.error = null;
    authStore.email = "";
    authStore.password = "";
    authStore.username = "";
    authStore.roleId = 0;
    vi.clearAllMocks();
  });

  it("sets user on successful fetch", async () => {
    mockedAxios.get.mockResolvedValue({ data: testUser });
    await authStore.fetchUser();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/auth/user`,
      { withCredentials: true }
    );
    expect(authStore.user).toEqual(testUser);
    expect(authStore.loading).toBe(false);
  });

  it("handles error and clears user", async () => {
    authStore.user = testUser;
    mockedAxios.get.mockRejectedValue(new Error("fail"));
    await authStore.fetchUser();
    expect(authStore.user).toBeNull();
    expect(authStore.loading).toBe(false);
  });

  it("logs in successfully and clears credentials", async () => {
    authStore.email = "e";
    authStore.password = "p";
    mockedAxios.post.mockResolvedValue({ data: testUser });

    await authStore.login("e", "p");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/auth/login`,
      { email: "e", password: "p" },
      { withCredentials: true }
    );
    expect(authStore.user).toEqual(testUser);
    expect(authStore.email).toBe("");
    expect(authStore.password).toBe("");
    expect(authStore.error).toBeNull();
    expect(authStore.loading).toBe(false);
  });

  it("login sets error on failure", async () => {
    const err = { response: { data: "Invalid" }, message: "err" };
    mockedAxios.post.mockRejectedValue(err);

    await authStore.login("e", "p");

    expect(authStore.error).toBe("Invalid");
    expect(authStore.loading).toBe(false);
  });

  it("registers successfully and clears fields", async () => {
    authStore.email = "e";
    authStore.username = "u";
    authStore.password = "p";
    authStore.roleId = 2;
    mockedAxios.post.mockResolvedValue({ data: testUser });

    await authStore.register("e", "u", "p", 2);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/auth/register`,
      { email: "e", username: "u", password: "p", roleId: 2 }
    );
    expect(authStore.user).toEqual(testUser);
    expect(authStore.email).toBe("");
    expect(authStore.username).toBe("");
    expect(authStore.password).toBe("");
    expect(authStore.roleId).toBe(0);
    expect(authStore.error).toBeNull();
    expect(authStore.loading).toBe(false);
  });

  it("register sets error on failure", async () => {
    const err = { response: { data: "Err" } };
    mockedAxios.post.mockRejectedValue(err);

    await authStore.register("e", "u", "p", 3);

    expect(authStore.error).toBe("Err");
    expect(authStore.loading).toBe(false);
  });

  it("clears user and navigates on logout", async () => {
    authStore.user = testUser;
    mockedAxios.post.mockResolvedValue({});

    await authStore.logout(navigateMock);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${ApiEndpointsUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
    expect(authStore.user).toBeNull();
    expect(authStore.loading).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("isAuthenticated returns false when no user", () => {
    authStore.user = null;
    expect(authStore.isAuthenticated).toBe(false);
  });

  it("isAuthenticated returns true when user exists", () => {
    authStore.user = testUser;
    expect(authStore.isAuthenticated).toBe(true);
  });

  it("role flags and isOwnerOfProperty", () => {
    authStore.user = { ...testUser, role: "Owner", userId: 5 };
    expect(authStore.isAdmin).toBe(false);
    expect(authStore.isOwner).toBe(true);
    expect(authStore.isCustomer).toBe(false);
    expect(authStore.isOwnerOfProperty(5)).toBe(true);
    expect(authStore.isOwnerOfProperty(6)).toBe(false);
  });
});
