import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

class LocationStore {
  query: string = "";
  suggestions: LocationSuggestion[] = [];
  loading = false;
  searchTimeout: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  setQuery(query: string) {
    this.query = query;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.length > 2) {
      this.searchTimeout = setTimeout(() => {
        this.searchLocation(query);
      }, 400);
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: LocationSuggestion) {
    this.query = suggestion.display_name;
    this.suggestions = [];

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }

  async searchLocation(query: string) {
    this.loading = true;
    try {
      const res = await axios.get<LocationSuggestion[]>(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            addressdetails: 1,
          },
        }
      );
      runInAction(() => {
        this.suggestions = res.data;
      });
    } catch (err) {
      console.error("Failed to fetch location suggestions", err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  cleanup() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    this.query = "";
    this.suggestions = [];
  }
}

export default new LocationStore();
