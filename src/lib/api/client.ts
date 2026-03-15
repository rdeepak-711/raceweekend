/**
 * Centralized API client for all external data providers.
 * Handles errors, logging, and consistent fetch configurations.
 */

export interface FetchOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
  silent?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText} at ${url}`);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  url: string | URL,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags, silent = false, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    next: {
      revalidate,
      tags,
    },
  };

  try {
    const response = await fetch(url.toString(), config);
    const text = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = text || 'No error details provided';
      }
      
      const error = new ApiError(
        response.status,
        response.statusText,
        url.toString(),
        errorData
      );

      if (!silent) {
        // Use console.warn for common external failures to reduce noise
        if (response.status >= 500) {
          console.warn(`[API EXTERNAL ERROR] ${error.message}`);
        } else {
          console.error(`[API FETCH ERROR] ${error.message}`, {
            url: url.toString(),
            status: response.status,
            data: errorData,
          });
        }
      }

      throw error;
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      if (!silent) {
        console.error(`[API PARSE ERROR] Failed to parse JSON from ${url.toString()}`, { text });
      }
      throw new Error(`Failed to parse response from ${url.toString()} as JSON`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const message = error instanceof Error ? error.message : 'Unknown network error';
    if (!silent) {
      console.error(`[API NETWORK ERROR] ${message} for ${url.toString()}`);
    }
    throw new Error(`Network error fetching ${url.toString()}: ${message}`);
  }
}
