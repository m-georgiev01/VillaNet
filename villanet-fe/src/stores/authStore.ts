import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { ApiEndpointsUrl } from "../common/models";

export interface IUser {
  username: string;
  email: string;
  role: "Customer" | "Owner" | "Admin";
  userId: number;
}

class AuthStore {
  user: IUser | null = null;
  loading: boolean = true;
  error: string | null = null;
  email: string = "";
  password: string = "";
  username: string = "";
  roleId: number = 0;

  constructor() {
    makeAutoObservable(this);
    this.fetchUser();
  }

  async fetchUser() {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.get(`${ApiEndpointsUrl}/auth/user`, {
        withCredentials: true,
      });
      runInAction(() => {
        this.user = res.data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.user = null;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async login(email: string, password: string) {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.post<IUser>(
        `${ApiEndpointsUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      runInAction(() => {
        this.user = res.data;
        this.email = "";
        this.password = "";
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = typeof(err.response?.data) === "string" ? err.response?.data : err.message ? err.message : "Login failed";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async register(
    email: string,
    username: string,
    password: string,
    roleId: number
  ) {
    this.loading = true;
    this.error = null;

    try {
      const res = await axios.post<IUser>(`${ApiEndpointsUrl}/auth/register`, {
        email,
        username,
        password,
        roleId,
      });
      runInAction(() => {
        this.user = res.data;
        this.email = "";
        this.username = "";
        this.password = "";
        this.roleId = 0;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data || "Registration failed";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async logout(navigate: (path: string) => void) {
    this.loading = true;

    try {
      await axios.post(
        `${ApiEndpointsUrl}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore
    } finally {
      runInAction(() => {
        this.user = null;
        this.loading = false;
        navigate("/login");
      });
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.user);
  }

  get isAdmin(): boolean {
    return this.role === "Admin";
  }

  get isOwner(): boolean {
    return this.role === "Owner";
  }

  get isCustomer(): boolean {
    return this.role === "Customer";
  }

  isOwnerOfProperty(ownerId: number): boolean {
    return this.isOwner && this.user?.userId === ownerId;
  }

  private get role(): IUser["role"] | undefined {
    return this.user?.role;
  }
}

export default new AuthStore();
