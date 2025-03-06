import { ICommunity } from "../models/Community";

export type CommunityFormData = Omit<ICommunity, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getcommunities() {
    return this.fetch<ICommunity[]>("/community");
  }

  async getcommunity(id: string) {
    return this.fetch<ICommunity>(`/community/${id}`);
  }

  async createCommunity(CommunityData: CommunityFormData) {
    return this.fetch<ICommunity>("/community", {
      method: "POST",
      body: CommunityData,
    });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: body,
    });
  }
}

export const apiClient = new ApiClient();
