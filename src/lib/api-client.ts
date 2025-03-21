import { ICommunity } from "../models/Community";
import { ImageFormData } from "../components/ImageUploadForm";
import { IImage } from "@/models/Image";

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

  async getcommunity(slug: string) {
    return this.fetch<ICommunity>(`/community/${slug}`);
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

  async getImages(id: string) {
    return this.fetch<IImage[]>(`/image/${id}`);
  }
  async createImage(imageData: ImageFormData) {
    return this.fetch<IImage>("/image", {
      method: "POST",
      body: imageData,
    });
  }
}

export const apiClient = new ApiClient();
