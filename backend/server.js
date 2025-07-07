import express from "express";
import cors from "cors";
import compression from "compression";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import CommunityPlan from "./models/CommunityPlan.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://forrest-fire-fund-cnx.vercel.app",
    "https://forrest-fire-fund-cnx.onrender.com",
    process.env.FRONTEND_URL,
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors(corsOptions));
app.use(express.json());

// Load and cache all data files on startup
let gisData, communityPlans;
let cachedData = {};

const loadDataFiles = () => {
  try {
    console.log("📦 Loading data files into memory...");

    // Load village and community plan data
    gisData = JSON.parse(
      readFileSync(join(__dirname, "allfvill_newuid.geojson"), "utf8")
    );
    communityPlans = JSON.parse(
      readFileSync(join(__dirname, "comunity-plan.json"), "utf8")
    );

    // Cache all GeoJSON files
    const dataFiles = [
      { key: "forestTypes", file: "forrest-type-cnx.json" },
      { key: "firebreaks", file: "wildfire_protect_all-20vills.geojson" },
      { key: "fuelManagement", file: "Fuel_Manage_20vills.geojson" },
      { key: "fireSentry", file: "FireSentry_Station_All.geojson" },
      { key: "villageWeirs", file: "Village_Weir_All.geojson" },
      { key: "wildfireCheck", file: "WildFire_Check_All_1.geojson" },
      { key: "burnAreas", file: "burn_area_2024.geojson" },
    ];

    dataFiles.forEach(({ key, file }) => {
      try {
        const filePath = join(__dirname, "data", file);
        if (existsSync(filePath)) {
          cachedData[key] = JSON.parse(readFileSync(filePath, "utf8"));
          console.log(`✅ Cached ${key} data`);
        } else {
          console.log(`⚠️  File not found: ${file}`);
          cachedData[key] = null;
        }
      } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
        cachedData[key] = null;
      }
    });

    console.log(`✅ Loaded ${gisData.features.length} villages from GIS data`);
    console.log(
      `✅ Loaded ${Object.keys(communityPlans.villages).length} community plans`
    );
    console.log(`✅ Cached ${Object.keys(cachedData).length} data files`);
  } catch (error) {
    console.error("❌ Error loading data files:", error);
    process.exit(1);
  }
};

// Load all data on startup
loadDataFiles();

// Function to determine village status based on community plan
const getVillageStatus = (communityPlan) => {
  const hasPlan = !!communityPlan;

  if (!hasPlan) {
    // Villages without plans need both volunteers and funding
    return {
      hasPlan: false,
      needsVolunteers: true,
      needsFunding: true,
    };
  }

  // For villages with plans, check if they need additional support
  const needsVolunteers =
    !communityPlan.volunteers ||
    !communityPlan.volunteers.length ||
    communityPlan.volunteers.length < 5;

  const needsFunding =
    !communityPlan.budget_info ||
    !communityPlan.budget_info.total_budget ||
    communityPlan.budget_info.total_budget < 10000;

  return {
    hasPlan: true,
    needsVolunteers,
    needsFunding,
  };
};

// Function to convert GeoJSON coordinates to Leaflet format
const convertCoordinates = (geoJsonCoords) => {
  if (!geoJsonCoords || !Array.isArray(geoJsonCoords)) return [];

  return geoJsonCoords.map(
    (ring) => ring.map((coord) => [coord[1], coord[0]]) // Swap [lng, lat] to [lat, lng]
  );
};

// Function to find matching community plan for a village using new-uid
const findCommunityPlan = (villageUID) => {
  const villagesData = communityPlans.villages;
  if (!villagesData || !villageUID) return null;

  // Search through all village entries using new-uid for exact matching
  for (const villageKey in villagesData) {
    const plan = villagesData[villageKey];
    const planUID = plan.village_info?.["new-uid"];

    if (planUID === villageUID) {
      return plan;
    }
  }

  return null;
};

// Function to process and combine village data
const processVillageData = () => {
  return gisData.features.map((feature, index) => {
    const properties = feature.properties;

    // Extract village information
    const villageName = properties.Vill_Th;
    const district = properties.Amp_Th;
    const subdistrict = properties.Tam_Th;
    const province = properties.Prov_Th;
    const villageUID = properties["new-uid"];

    // Find matching community plan using new-uid
    const communityPlan = findCommunityPlan(villageUID);

    // Get village status
    const status = getVillageStatus(communityPlan);

    // Convert coordinates
    const coordinates = convertCoordinates(feature.geometry?.coordinates?.[0]);

    return {
      id: index + 1,
      name: villageName || "ไม่ระบุชื่อ",
      code: properties.Vill_Code,
      district,
      subdistrict,
      province,
      coordinates,
      status,
      communityPlan,
      // Additional GIS properties for compatibility
      gisData: {
        geometry: feature.geometry,
        ...properties,
      },
    };
  });
};

// Process village data on startup
const villages = processVillageData();
console.log(`✅ Processed ${villages.length} villages with combined data`);

// Calculate statistics
const calculateStats = () => {
  const stats = {
    totalVillages: villages.length,
    withPlan: 0,
    withoutPlan: 0,
    needVolunteers: 0,
    needFunding: 0,
    needHelp: 0, // Villages that need any type of help
  };

  villages.forEach((village) => {
    if (village.status.hasPlan) {
      stats.withPlan++;
    } else {
      stats.withoutPlan++;
    }

    if (village.status.needsVolunteers) {
      stats.needVolunteers++;
    }

    if (village.status.needsFunding) {
      stats.needFunding++;
    }

    // Count villages that need any type of help (volunteers OR funding)
    if (village.status.needsVolunteers || village.status.needsFunding) {
      stats.needHelp++;
    }
  });

  return stats;
};

// API Routes

// Get all villages
app.get("/api/villages", (req, res) => {
  try {
    res.json({
      success: true,
      data: villages,
      total: villages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch villages",
      message: error.message,
    });
  }
});

// Get village by ID
app.get("/api/villages/:id", (req, res) => {
  try {
    const village = villages.find((v) => v.id === req.params.id);

    if (!village) {
      return res.status(404).json({
        success: false,
        error: "Village not found",
      });
    }

    res.json({
      success: true,
      data: village,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch village",
      message: error.message,
    });
  }
});

// Get filtered villages
app.get("/api/villages/filter/:type", (req, res) => {
  try {
    const { type } = req.params;
    let filteredVillages = [];

    switch (type) {
      case "with-plan":
        filteredVillages = villages.filter((v) => v.status.hasPlan);
        break;
      case "without-plan":
        filteredVillages = villages.filter((v) => !v.status.hasPlan);
        break;
      case "need-volunteers":
        filteredVillages = villages.filter((v) => v.status.needsVolunteers);
        break;
      case "need-funding":
        filteredVillages = villages.filter((v) => v.status.needsFunding);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid filter type",
        });
    }

    res.json({
      success: true,
      data: filteredVillages,
      total: filteredVillages.length,
      filter: type,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to filter villages",
      message: error.message,
    });
  }
});

// Get statistics
app.get("/api/stats", (req, res) => {
  try {
    const stats = calculateStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to calculate statistics",
      message: error.message,
    });
  }
});

// Batch API endpoint - get multiple datasets in one request
app.post("/api/batch-data", (req, res) => {
  try {
    const { datasets = [] } = req.body;

    if (!Array.isArray(datasets) || datasets.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message:
          "datasets array is required and must contain at least one dataset name",
      });
    }

    const availableDatasets = [
      "villages",
      "villagesLight", // New simplified version
      "stats",
      "forestTypes",
      "firebreaks",
      "fuelManagement",
      "fireSentry",
      "villageWeirs",
      "wildfireCheck",
      "burnAreas",
      "burnAreasSimplified",
    ];

    const batchData = {};
    const errors = {};

    datasets.forEach((dataset) => {
      try {
        switch (dataset) {
          case "villages":
            // For batch requests, return simplified villages data to prevent memory issues
            batchData.villages = villages.slice(0, 100).map((village) => ({
              id: village.id,
              name: village.name,
              code: village.code,
              district: village.district,
              subdistrict: village.subdistrict,
              province: village.province,
              status: village.status,
              // Exclude heavy coordinates and gisData
            }));
            break;
          case "villagesLight":
            // Lightweight version with just essential data
            batchData.villagesLight = villages.map((village) => ({
              id: village.id,
              name: village.name,
              district: village.district,
              subdistrict: village.subdistrict,
              status: village.status,
            }));
            break;
          case "stats":
            batchData.stats = calculateStats();
            break;
          case "forestTypes":
            batchData.forestTypes = cachedData.forestTypes;
            break;
          case "firebreaks":
            batchData.firebreaks = cachedData.firebreaks;
            break;
          case "fuelManagement":
            batchData.fuelManagement = cachedData.fuelManagement;
            break;
          case "fireSentry":
            batchData.fireSentry = cachedData.fireSentry;
            break;
          case "villageWeirs":
            batchData.villageWeirs = cachedData.villageWeirs;
            break;
          case "wildfireCheck":
            batchData.wildfireCheck = cachedData.wildfireCheck;
            break;
          case "burnAreas":
            batchData.burnAreas = cachedData.burnAreas;
            break;
          case "burnAreasSimplified":
            if (cachedData.burnAreas) {
              batchData.burnAreasSimplified = {
                type: "FeatureCollection",
                features: cachedData.burnAreas.features
                  .slice(0, 10000)
                  .map((feature) => ({
                    type: "Feature",
                    properties: {
                      OBJECTID: feature.properties.OBJECTID,
                    },
                    geometry: feature.geometry,
                  })),
              };
            }
            break;
          default:
            errors[
              dataset
            ] = `Unknown dataset: ${dataset}. Available: ${availableDatasets.join(
              ", "
            )}`;
        }
      } catch (error) {
        errors[dataset] = error.message;
      }
    });

    const response = {
      success: true,
      data: batchData,
      requested: datasets,
      available: availableDatasets,
    };

    if (Object.keys(errors).length > 0) {
      response.errors = errors;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch batch data",
      message: error.message,
    });
  }
});

// Get forest types data
app.get("/api/forest-types", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.forestTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch forest types",
      message: error.message,
    });
  }
});

// Get building data for a specific village by UID
app.get("/api/buildings/:uid", (req, res) => {
  try {
    const { uid } = req.params;
    const buildingFilePath = join(
      __dirname,
      "data",
      "builing-in-village",
      `new-uid_${uid}.geojson`
    );

    // Check if the building file exists
    if (!existsSync(buildingFilePath)) {
      return res.json({
        success: true,
        data: null,
        message: "No building data available for this village",
      });
    }

    const buildingData = JSON.parse(readFileSync(buildingFilePath, "utf8"));
    res.json({
      success: true,
      data: buildingData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch building data",
      message: error.message,
    });
  }
});

// Get firebreak lines data
app.get("/api/firebreaks", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.firebreaks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch firebreak data",
      message: error.message,
    });
  }
});

// Get fuel management areas data
app.get("/api/fuel-management", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.fuelManagement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch fuel management data",
      message: error.message,
    });
  }
});

// Get fire sentry stations data
app.get("/api/fire-sentry-stations", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.fireSentry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch fire sentry station data",
      message: error.message,
    });
  }
});

// Get village weirs data
app.get("/api/village-weirs", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.villageWeirs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch village weirs data",
      message: error.message,
    });
  }
});

// Get wildfire check points data
app.get("/api/wildfire-check-points", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.wildfireCheck,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch wildfire check points data",
      message: error.message,
    });
  }
});

// Get burn area 2024 data
app.get("/api/burn-areas-2024", (req, res) => {
  try {
    res.json({
      success: true,
      data: cachedData.burnAreas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch burn area 2024 data",
      message: error.message,
    });
  }
});

// Get burn area 2024 data (simplified for performance)
app.get("/api/burn-areas-2024-simplified", (req, res) => {
  try {
    if (!cachedData.burnAreas) {
      return res.status(404).json({
        success: false,
        error: "Burn areas data not available",
      });
    }

    // Simplify the data for better performance - take only first 10,000 features
    const simplifiedData = {
      type: "FeatureCollection",
      features: cachedData.burnAreas.features
        .slice(0, 10000)
        .map((feature) => ({
          type: "Feature",
          properties: {
            OBJECTID: feature.properties.OBJECTID,
          },
          geometry: feature.geometry,
        })),
    };

    res.json({
      success: true,
      data: simplifiedData,
      message: `Simplified dataset with ${simplifiedData.features.length} features out of ${cachedData.burnAreas.features.length} total`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch simplified burn area 2024 data",
      message: error.message,
    });
  }
});

// ===== COMMUNITY PLAN SUBMISSION API =====

// Submit a new community plan
app.post("/api/community-plans", async (req, res) => {
  try {
    const planData = req.body;

    // Validate required fields
    if (
      !planData.village_info?.name ||
      !planData.village_info?.moo ||
      !planData.village_info?.subdistrict ||
      !planData.village_info?.district
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required village information",
        message: "Village name, moo, subdistrict, and district are required",
      });
    }

    // Create new community plan
    const communityPlan = new CommunityPlan(planData);
    const savedPlan = await communityPlan.save();

    console.log(
      `✅ New community plan submitted for: ${planData.village_info.name}`
    );

    res.status(201).json({
      success: true,
      message: "Community plan submitted successfully",
      data: {
        id: savedPlan._id,
        village_name: savedPlan.village_info.name,
        status: savedPlan.status,
        submitted_at: savedPlan.submitted_at,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting community plan:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: error.message,
        details: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to submit community plan",
      message: error.message,
    });
  }
});

// Get all community plans (for admin)
app.get("/api/community-plans", async (req, res) => {
  try {
    const { status, page = 1, limit = 10, district, subdistrict } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (district) query["village_info.district"] = district;
    if (subdistrict) query["village_info.subdistrict"] = subdistrict;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get plans with pagination
    const plans = await CommunityPlan.find(query)
      .sort({ submitted_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "village_info.name village_info.district village_info.subdistrict status submitted_at budget.allocated budget.shortage"
      );

    const total = await CommunityPlan.countDocuments(query);

    res.json({
      success: true,
      data: plans,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching community plans:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community plans",
      message: error.message,
    });
  }
});

// Get a specific community plan by ID
app.get("/api/community-plans/:id", async (req, res) => {
  try {
    const plan = await CommunityPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Community plan not found",
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("❌ Error fetching community plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community plan",
      message: error.message,
    });
  }
});

// Update community plan status (for admin)
app.patch("/api/community-plans/:id/status", async (req, res) => {
  try {
    const { status, notes, reviewed_by } = req.body;

    if (!["pending", "approved", "rejected", "under_review"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
        message:
          "Status must be one of: pending, approved, rejected, under_review",
      });
    }

    const plan = await CommunityPlan.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        reviewed_by,
        reviewed_at: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Community plan not found",
      });
    }

    console.log(
      `✅ Plan status updated: ${plan.village_info.name} -> ${status}`
    );

    res.json({
      success: true,
      message: "Plan status updated successfully",
      data: {
        id: plan._id,
        village_name: plan.village_info.name,
        status: plan.status,
        reviewed_at: plan.reviewed_at,
      },
    });
  } catch (error) {
    console.error("❌ Error updating plan status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update plan status",
      message: error.message,
    });
  }
});

// Get community plan statistics
app.get("/api/community-plans/stats/overview", async (req, res) => {
  try {
    const stats = await CommunityPlan.getStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching plan statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

// Delete a community plan (for admin)
app.delete("/api/community-plans/:id", async (req, res) => {
  try {
    const plan = await CommunityPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Community plan not found",
      });
    }

    console.log(`🗑️ Plan deleted: ${plan.village_info.name}`);

    res.json({
      success: true,
      message: "Community plan deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting community plan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete community plan",
      message: error.message,
    });
  }
});

// Submit support request
app.post("/api/support", async (req, res) => {
  try {
    const { villageId, villageName, supportType, donorInfo, support } =
      req.body;

    // Validate required fields
    if (!villageId || !villageName || !supportType || !donorInfo || !support) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message:
          "villageId, villageName, supportType, donorInfo, and support are required",
      });
    }

    // Validate donor info
    if (!donorInfo.name || !donorInfo.email) {
      return res.status(400).json({
        success: false,
        error: "Missing donor information",
        message: "Donor name and email are required",
      });
    }

    // Validate support data based on type
    if (supportType === "money" && (!support.amount || support.amount <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Invalid money support",
        message: "Amount must be greater than 0",
      });
    }

    if (
      supportType === "equipment" &&
      (!support.equipment || !support.quantity || support.quantity <= 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid equipment support",
        message: "Equipment name and quantity (> 0) are required",
      });
    }

    // Create support record (you might want to create a Support model similar to CommunityPlan)
    const supportRecord = {
      villageId,
      villageName,
      supportType,
      donorInfo: {
        name: donorInfo.name,
        email: donorInfo.email,
        phone: donorInfo.phone || null,
      },
      support,
      submittedAt: new Date(),
      status: "pending", // pending, confirmed, completed
    };

    // For now, just log it (in production, you'd save to database)
    console.log("🤝 New support submission:", {
      village: villageName,
      type: supportType,
      donor: donorInfo.name,
      details:
        supportType === "money"
          ? `฿${support.amount}`
          : `${support.equipment} x${support.quantity}`,
    });

    // Here you would typically save to a Support collection in MongoDB
    // const savedSupport = await Support.create(supportRecord);

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
      data: {
        id: `support_${Date.now()}`, // In production, use actual database ID
        village: villageName,
        type: supportType,
        submittedAt: supportRecord.submittedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting support request:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit support request",
      message: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Fire Management API is running",
    timestamp: new Date().toISOString(),
    villages: villages.length,
    mongodb_connected: mongoose.connection.readyState === 1,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fire Management API server running on port ${PORT}`);
  console.log(`📊 Serving data for ${villages.length} villages`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
