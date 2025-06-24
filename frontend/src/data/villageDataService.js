import apiService from "../services/apiService.js";

// Cache for village data
let villagesCache = null;
let statsCache = null;

// Get all villages from API
export const getAllVillages = async () => {
  if (!villagesCache) {
    try {
      villagesCache = await apiService.getAllVillages();
    } catch (error) {
      console.error("Failed to fetch villages:", error);
      throw error;
    }
  }
  return villagesCache;
};

// Get village by ID
export const getVillageById = async (id) => {
  try {
    return await apiService.getVillageById(id);
  } catch (error) {
    console.error(`Failed to fetch village ${id}:`, error);
    throw error;
  }
};

// Get filtered villages based on criteria
export const getFilteredVillages = async (filters) => {
  try {
    const allVillages = await getAllVillages();

    if (!filters || Object.keys(filters).length === 0) {
      return allVillages;
    }

    // Apply filters
    return allVillages.filter((village) => {
      const { status } = village;

      // Check if any filter is active
      const hasActiveFilters = Object.values(filters).some(
        (filter) => filter === true
      );
      if (!hasActiveFilters) {
        return true;
      }

      // Apply individual filters
      if (filters.showWithPlan && status.hasPlan) return true;
      if (filters.showWithoutPlan && !status.hasPlan) return true;
      if (filters.showNeedVolunteers && status.needsVolunteers) return true;
      if (filters.showNeedFunding && status.needsFunding) return true;

      return false;
    });
  } catch (error) {
    console.error("Failed to filter villages:", error);
    throw error;
  }
};

// Get village statistics
export const getVillageStats = async () => {
  if (!statsCache) {
    try {
      statsCache = await apiService.getStats();
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw error;
    }
  }
  return statsCache;
};

// Clear cache (useful for refreshing data)
export const clearCache = () => {
  villagesCache = null;
  statsCache = null;
};

// Health check
export const healthCheck = async () => {
  try {
    return await apiService.healthCheck();
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};
