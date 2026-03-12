import axios, { AxiosRequestConfig, Method } from "axios";
import { environment } from "../../environments/environment";
import AuthService from "../../services/AuthService";



type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method: HttpMethod | Lowercase<HttpMethod>;
  body?: any;
  skipAuthHeader?: boolean;
  errorMessage?: string;
  responseType?: "json" | "blob";
}

export const sendApiRequest = async <T>(
  endpoint: string,
  { method, body, skipAuthHeader, errorMessage, responseType = "json" }: ApiRequestOptions
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      url: `${window.location.protocol}//${window.location.hostname}${environment.apiUrl}${endpoint}`,
      method: method.toUpperCase() as Method,
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
      responseType: responseType,
    };

    if (!skipAuthHeader) {
      const authHeader = AuthService.getAuthHeader();
      config.headers![authHeader.key] = authHeader.value;
    }

    const response = await axios.request<T>(config);

    if (response.status === 204) {
      return [] as unknown as T;
    }
    
    return response.data;
  } catch (error: any) {
    console.error("API error:", error);

    // If there's a backend response, preserve the original axios error
    if (error.response?.data) {
      throw error;
    }

    // Otherwise create a new Error with custom message
    throw new Error(errorMessage || "Unexpected API error occurred.");
  }
};