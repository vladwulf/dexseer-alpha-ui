// Client-side API client for klines database
// Use this in React components instead of importing klines-db directly

import type { ParsedKLine } from "./extract-from-binance";

const API_BASE_URL = import.meta.env.VITE_KLINES_API_URL || "http://localhost:3001";

export class KlinesAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all available assets
   */
  async getAssets(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/assets`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get klines for a specific asset
   */
  async getKlines(asset: string, limit?: number): Promise<ParsedKLine[]> {
    const params = new URLSearchParams({ asset });
    if (limit) {
      params.append("limit", limit.toString());
    }
    const response = await fetch(`${this.baseUrl}/api/klines?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch klines: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get klines for a specific asset within a time range
   */
  async getKlinesByTimeRange(
    asset: string,
    startTime: number,
    endTime: number
  ): Promise<ParsedKLine[]> {
    const params = new URLSearchParams({
      asset,
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    });
    const response = await fetch(`${this.baseUrl}/api/klines/range?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch klines: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(asset: string) {
    const params = new URLSearchParams({ asset });
    const response = await fetch(`${this.baseUrl}/api/stats?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    return response.json();
  }
}

// Singleton instance
let apiClient: KlinesAPIClient | null = null;

export function getKlinesAPI(): KlinesAPIClient {
  if (!apiClient) {
    apiClient = new KlinesAPIClient();
  }
  return apiClient;
}

