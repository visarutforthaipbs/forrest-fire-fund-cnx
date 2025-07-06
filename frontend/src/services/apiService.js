import { API_BASE_URL } from "../config/api.js";

class ApiService {
  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all villages
  async getAllVillages() {
    return this.fetchWithErrorHandling("/villages");
  }

  // Get village by ID
  async getVillageById(id) {
    return this.fetchWithErrorHandling(`/villages/${id}`);
  }

  // Get filtered villages
  async getFilteredVillages(filterType) {
    return this.fetchWithErrorHandling(`/villages/filter/${filterType}`);
  }

  // Get statistics
  async getStats() {
    return this.fetchWithErrorHandling("/stats");
  }

  // Health check
  async healthCheck() {
    return this.fetchWithErrorHandling("/health");
  }

  // Batch API - get multiple datasets in one request
  async getBatchData(datasets) {
    try {
      const response = await fetch(`${API_BASE_URL}/batch-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datasets }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Batch API request failed");
      }

      return data.data;
    } catch (error) {
      console.error("Batch API Error:", error);
      throw error;
    }
  }
}

export default new ApiService();
