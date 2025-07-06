import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import * as topojson from "topojson-client";
import { getApiUrl } from "../config/api";
import {
  Box,
  Button,
  Text,
  VStack,
  Badge,
  HStack,
  Spinner,
  Center,
  IconButton,
  Tooltip,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  getFilteredVillages,
  getAllVillages,
} from "../data/villageDataService";
import "leaflet/dist/leaflet.css";

// Define tile URLs for different base maps
const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// Define attributions for different base maps
const TILE_ATTRIBUTIONS = {
  light:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite:
    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
};

// Function to get polygon color based on village status
const getPolygonColor = (village) => {
  if (village.status.hasPlan) {
    return "#4CAF50"; // Green for villages with plans
  } else if (village.status.needsVolunteers && village.status.needsFunding) {
    return "#F47B20"; // Red for villages needing both volunteers and funding
  } else if (village.status.needsVolunteers) {
    return "#f59e0b"; // Orange for villages needing volunteers
  } else if (village.status.needsFunding) {
    return "#3b82f6"; // Blue for villages needing funding
  }
  return "#6b7280"; // Gray for villages without plans
};

// Get forest type color
const getForestTypeColor = (forestTypeName) => {
  const forestColors = {
    ป่าดิบเขา: "#0D4F3C", // Dark green
    ป่าดิบแล้ง: "#2F855A", // Medium green
    ป่าเต็งรัง: "#68D391", // Light green
    ป่าที่ฟื้นฟูตามธรรมชาติ: "#9AE6B4", // Very light green
    ป่าทุ่ง: "#F7FAFC", // Very light gray
    ป่าเบญจพรรณ: "#38A169", // Forest green
    ป่าไผ่: "#81C784", // Bamboo green
    ป่าสนเขา: "#1A365D", // Dark blue-green
    สวนป่าสัก: "#D69E2E", // Golden brown
    สวนป่าอื่นๆ: "#ED8936", // Orange
    สังคมพืชลานหิน: "#A0AEC0", // Gray
  };
  return forestColors[forestTypeName] || "#CBD5E0";
};

// Function to get status badges
const getStatusBadges = (status) => {
  const badges = [];
  if (status.hasPlan) {
    badges.push(
      <Badge key="plan" colorScheme="green" size="sm">
        ✅ มีแผนแล้ว
      </Badge>
    );
  } else {
    badges.push(
      <Badge key="no-plan" colorScheme="red" size="sm">
        ❌ ยังไม่มี
      </Badge>
    );
  }
  if (status.needsVolunteers) {
    badges.push(
      <Badge key="volunteers" colorScheme="orange" size="sm">
        🔧 ต้องการอาสา
      </Badge>
    );
  }
  if (status.needsFunding) {
    badges.push(
      <Badge key="funding" colorScheme="blue" size="sm">
        💰 ต้องการเงิน
      </Badge>
    );
  }
  return badges;
};

// Convert GeoJSON coordinates to Leaflet format
const convertCoordinates = (geoJsonCoords) => {
  if (!geoJsonCoords || !geoJsonCoords[0] || !geoJsonCoords[0][0]) return [];

  // Handle MultiPolygon - take the first polygon's first ring
  // GeoJSON format is [lng, lat], Leaflet expects [lat, lng]
  return geoJsonCoords[0][0].map((coord) => [coord[1], coord[0]]);
};

// Calculate bounds for a polygon
const getPolygonBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;

  const lats = coordinates.map((coord) => coord[0]);
  const lngs = coordinates.map((coord) => coord[1]);

  return [
    [Math.min(...lats), Math.min(...lngs)], // Southwest
    [Math.max(...lats), Math.max(...lngs)], // Northeast
  ];
};

// Custom component to control map focus and highlighting
const MapController = ({ selectedVillage, onZoomChange }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedVillage) {
      const coordinates = convertCoordinates(
        selectedVillage.gisData.geometry.coordinates
      );

      if (coordinates.length > 0) {
        const bounds = getPolygonBounds(coordinates);
        if (bounds) {
          // Fit the map to show the selected village with some padding
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14,
          });
        }
      }
    }
  }, [selectedVillage, map]);

  useEffect(() => {
    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    };

    // Set initial zoom
    onZoomChange(map.getZoom());

    // Listen for zoom changes
    map.on("zoomend", handleZoomEnd);

    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onZoomChange]);

  return null;
};

// Basemap selector component
const BasemapSelector = ({ currentBasemap, onBasemapChange }) => {
  const basemapOptions = [
    {
      key: "light",
      label: "แผนที่สว่าง",
      icon: "🗺️",
      description: "แผนที่พื้นฐานสีสว่าง เหมาะสำหรับการดูข้อมูลทั่วไป",
    },
    {
      key: "dark",
      label: "แผนที่มืด",
      icon: "🌙",
      description: "แผนที่พื้นฐานสีมืด เหมาะสำหรับการดูในที่มืด",
    },
    {
      key: "satellite",
      label: "ภาพถ่ายดาวเทียม",
      icon: "🛰️",
      description: "ภาพถ่ายจากดาวเทียม เหมาะสำหรับการดูภูมิประเทศจริง",
    },
  ];

  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      bg="white"
      borderRadius="md"
      boxShadow="lg"
      zIndex={1000}
      p={2}
    >
      <Text fontSize="xs" fontWeight="semibold" mb={2} px={1} color="gray.600">
        เลือกแผนที่
      </Text>
      <ButtonGroup size="sm" isAttached variant="outline">
        {basemapOptions.map((option) => (
          <Tooltip
            key={option.key}
            label={option.description}
            placement="bottom"
            hasArrow
          >
            <IconButton
              aria-label={option.label}
              icon={<Text fontSize="lg">{option.icon}</Text>}
              isActive={currentBasemap === option.key}
              onClick={() => onBasemapChange(option.key)}
              colorScheme={currentBasemap === option.key ? "orange" : "gray"}
              variant={currentBasemap === option.key ? "solid" : "outline"}
              _hover={{
                bg: currentBasemap === option.key ? "orange.600" : "gray.100",
              }}
            />
          </Tooltip>
        ))}
      </ButtonGroup>
    </Box>
  );
};

const Map = ({ onVillageSelect, selectedVillage }) => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBasemap, setCurrentBasemap] = useState("light");
  const polygonRefs = useRef({});
  const [forestTypes, setForestTypes] = useState(null);
  const [showForestTypes, setShowForestTypes] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(9);
  const forestLayerRef = useRef(null);
  const [buildingData, setBuildingData] = useState(null);
  const [showBuildings, setShowBuildings] = useState(false);
  const buildingLayerRef = useRef(null);
  const [firebreakData, setFirebreakData] = useState(null);
  const [showFirebreaks, setShowFirebreaks] = useState(false);
  const firebreakLayerRef = useRef(null);
  const [fuelManagementData, setFuelManagementData] = useState(null);
  const [showFuelManagement, setShowFuelManagement] = useState(false);
  const fuelManagementLayerRef = useRef(null);

  // Fire Sentry Stations state
  const [fireSentryData, setFireSentryData] = useState(null);
  const [showFireSentry, setShowFireSentry] = useState(false);
  const fireSentryLayerRef = useRef(null);

  // Village Weirs state
  const [villageWeirsData, setVillageWeirsData] = useState(null);
  const [showVillageWeirs, setShowVillageWeirs] = useState(false);
  const villageWeirsLayerRef = useRef(null);

  // Wildfire Check Points state
  const [wildfireCheckData, setWildfireCheckData] = useState(null);
  const [showWildfireCheck, setShowWildfireCheck] = useState(false);
  const wildfireCheckLayerRef = useRef(null);

  // Burn Areas 2024 state
  const [burnAreasData, setBurnAreasData] = useState(null);
  const [showBurnAreas, setShowBurnAreas] = useState(false);
  const burnAreasLayerRef = useRef(null);

  // Progressive loading: Load critical data first, then optional layers
  useEffect(() => {
    const loadProgressiveData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import the API service
        const apiService = await import("../services/apiService.js");

        // Step 1: Load critical data first (villages and stats)
        console.log("🚀 Loading critical data (villages & stats)...");

        const criticalData = await apiService.default.getBatchData([
          "villages",
          "stats",
        ]);

        if (criticalData.villages) {
          setVillages(criticalData.villages);
          console.log("✅ Loaded villages:", criticalData.villages.length);
        }

        // Mark loading as complete for basic functionality
        setLoading(false);

        // Step 2: Load optional layers in background
        console.log("📦 Loading optional layers...");

        const optionalData = await apiService.default.getBatchData([
          "forestTypes",
          "firebreaks",
          "fuelManagement",
          "fireSentry",
          "villageWeirs",
          "wildfireCheck",
          "burnAreasSimplified",
        ]);

        // Set optional layer data
        if (optionalData.forestTypes) {
          setForestTypes(optionalData.forestTypes);
          console.log("✅ Loaded forest types");
        }

        if (optionalData.firebreaks) {
          setFirebreakData(optionalData.firebreaks);
          console.log("✅ Loaded firebreak data");
        }

        if (optionalData.fuelManagement) {
          setFuelManagementData(optionalData.fuelManagement);
          console.log("✅ Loaded fuel management data");
        }

        if (optionalData.fireSentry) {
          setFireSentryData(optionalData.fireSentry);
          console.log("✅ Loaded fire sentry data");
        }

        if (optionalData.villageWeirs) {
          setVillageWeirsData(optionalData.villageWeirs);
          console.log("✅ Loaded village weirs data");
        }

        if (optionalData.wildfireCheck) {
          setWildfireCheckData(optionalData.wildfireCheck);
          console.log("✅ Loaded wildfire check data");
        }

        if (optionalData.burnAreasSimplified) {
          setBurnAreasData(optionalData.burnAreasSimplified);
          console.log("✅ Loaded simplified burn areas data");
        }

        console.log("🎉 All optional layers loaded successfully!");
      } catch (err) {
        console.error("Failed to load map data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadProgressiveData();
  }, []);

  // Load building data for selected village
  useEffect(() => {
    // Immediately clear previous building data and hide buildings when village changes
    setBuildingData(null);
    setShowBuildings(false);

    const loadBuildingData = async () => {
      if (!selectedVillage) {
        console.log("🏠 Clearing building data - no village selected");
        return;
      }

      try {
        console.log(
          "🏠 Loading building data for village:",
          selectedVillage.name,
          "UID:",
          selectedVillage.gisData["new-uid"]
        );
        const response = await fetch(
          getApiUrl(`buildings/${selectedVillage.gisData["new-uid"]}`)
        );
        const result = await response.json();

        if (result.success && result.data) {
          console.log(
            "🏠 Loaded building data:",
            result.data.features.length,
            "buildings"
          );
          setBuildingData(result.data);
        } else {
          console.log("🏠 No building data available for this village");
          setBuildingData(null);
        }
      } catch (err) {
        console.error("Failed to load building data:", err);
        setBuildingData(null);
      }
    };

    loadBuildingData();
  }, [selectedVillage]);

  // Layer visibility management - now controlled by user choices
  const [userLayerPreferences, setUserLayerPreferences] = useState({
    forestTypes: false,
    firebreaks: false,
    fuelManagement: false,
    buildings: false,
    fireSentry: false,
    villageWeirs: false,
    wildfireCheck: false,
    burnAreas: false,
  });

  // Helper function to toggle layer visibility
  const toggleLayer = (layerName) => {
    setUserLayerPreferences((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  // Update layer visibility based on user preferences and data availability
  useEffect(() => {
    setShowForestTypes(userLayerPreferences.forestTypes && forestTypes);
    setShowFirebreaks(userLayerPreferences.firebreaks && firebreakData);
    setShowFuelManagement(
      userLayerPreferences.fuelManagement && fuelManagementData
    );
    setShowBuildings(userLayerPreferences.buildings && buildingData);
    setShowFireSentry(userLayerPreferences.fireSentry && fireSentryData);
    setShowVillageWeirs(userLayerPreferences.villageWeirs && villageWeirsData);
    setShowWildfireCheck(
      userLayerPreferences.wildfireCheck && wildfireCheckData
    );
    setShowBurnAreas(userLayerPreferences.burnAreas && burnAreasData);
  }, [
    userLayerPreferences,
    forestTypes,
    firebreakData,
    fuelManagementData,
    buildingData,
    fireSentryData,
    villageWeirsData,
    wildfireCheckData,
    burnAreasData,
  ]);

  // Auto-show buildings when a village is selected (but respect user preference)
  useEffect(() => {
    if (selectedVillage && buildingData && !userLayerPreferences.buildings) {
      setUserLayerPreferences((prev) => ({ ...prev, buildings: true }));
    }
  }, [selectedVillage, buildingData, userLayerPreferences.buildings]);

  // Forest overlay component
  const ForestOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !forestTypes || !showForestTypes) {
        // Remove existing forest layer if it exists
        if (forestLayerRef.current) {
          map.removeLayer(forestLayerRef.current);
          forestLayerRef.current = null;
        }
        return;
      }

      console.log("🌲 Adding forest overlay...");
      console.log("Forest types data:", forestTypes);

      try {
        // Convert TopoJSON to GeoJSON
        const geoData = topojson.feature(
          forestTypes,
          forestTypes.objects["forrest-type"]
        );

        console.log("🌲 Converted GeoJSON:", geoData);
        console.log("🌲 Number of forest features:", geoData.features.length);

        // Create forest layer
        const forestLayer = L.geoJSON(geoData, {
          style: (feature) => {
            const color = getForestTypeColor(feature.properties.ftype_name);
            console.log(
              `🌲 Styling ${feature.properties.ftype_name} with color ${color}`
            );
            return {
              fillColor: color,
              weight: 1,
              opacity: 0.8,
              color: "#ffffff",
              fillOpacity: 0.5,
            };
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>🌲 ${feature.properties.ftype_name}</strong><br/>
              </div>
            `);
          },
        });

        console.log("🌲 Forest layer created:", forestLayer);

        // Add to map
        forestLayer.addTo(map);
        forestLayerRef.current = forestLayer;

        console.log("🌲 Forest layer added to map");

        // Cleanup function
        return () => {
          if (forestLayerRef.current) {
            map.removeLayer(forestLayerRef.current);
            forestLayerRef.current = null;
          }
        };
      } catch (error) {
        console.error("🌲 Error adding forest overlay:", error);
      }
    }, [map, forestTypes, showForestTypes]);

    return null;
  };

  // Fuel management overlay component
  const FuelManagementOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !fuelManagementData || !showFuelManagement) {
        // Remove existing fuel management layer if it exists
        if (fuelManagementLayerRef.current) {
          map.removeLayer(fuelManagementLayerRef.current);
          fuelManagementLayerRef.current = null;
        }
        return;
      }

      console.log("🔥 Adding fuel management overlay...");
      console.log("Fuel management data:", fuelManagementData);

      try {
        // Create fuel management layer
        const fuelManagementLayer = L.geoJSON(fuelManagementData, {
          style: (feature) => {
            // Different colors based on management type
            const managementType = feature.properties.FM_Manag;
            let fillColor = "#8B4513"; // Default brown

            if (managementType && managementType.includes("ชิงเผา")) {
              fillColor = "#FF6B35"; // Orange for controlled burning
            } else if (
              managementType &&
              managementType.includes("ไม่ให้เกิดไฟ")
            ) {
              fillColor = "#4CAF50"; // Green for fire prevention
            } else if (managementType && managementType.includes("ปลูกเสริม")) {
              fillColor = "#2E7D32"; // Dark green for reforestation
            }

            return {
              fillColor: fillColor,
              weight: 2,
              opacity: 0.8,
              color: "#333333", // Dark border
              fillOpacity: 0.6,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const popupContent = `
              <div style="font-family: 'Sarabun', sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #2D3748;">🔥 พื้นที่จัดการเชื้อเพลิง</h4>
                <p style="margin: 4px 0;"><strong>หมู่บ้าน:</strong> ${
                  props.Vill_Th || "ไม่ระบุ"
                }</p>
                <p style="margin: 4px 0;"><strong>ตำบล:</strong> ${
                  props.Tam_Th || "ไม่ระบุ"
                }</p>
                <p style="margin: 4px 0;"><strong>อำเภอ:</strong> ${
                  props.Amp_Th || "ไม่ระบุ"
                }</p>
                <p style="margin: 4px 0;"><strong>วิธีการจัดการ:</strong> ${
                  props.FM_Manag || "ไม่ระบุ"
                }</p>
                <p style="margin: 4px 0;"><strong>ช่วงเวลา:</strong> ${
                  props.FM_Month || "ไม่ระบุ"
                }</p>
                <p style="margin: 4px 0;"><strong>พื้นที่:</strong> ${
                  props.A_RAI ? props.A_RAI.toFixed(2) + " ไร่" : "ไม่ระบุ"
                }</p>
                ${
                  props.FM_Loca
                    ? `<p style="margin: 4px 0;"><strong>สถานที่:</strong> ${props.FM_Loca}</p>`
                    : ""
                }
                ${
                  props.FM_OrgSup
                    ? `<p style="margin: 4px 0;"><strong>หน่วยงานสนับสนุน:</strong> ${props.FM_OrgSup}</p>`
                    : ""
                }
              </div>
            `;
            layer.bindPopup(popupContent);
          },
        });

        // Add layer to map
        fuelManagementLayer.addTo(map);
        fuelManagementLayerRef.current = fuelManagementLayer;

        console.log("✅ Fuel management overlay added successfully");
      } catch (error) {
        console.error("❌ Error adding fuel management overlay:", error);
      }
    }, [map, fuelManagementData, showFuelManagement]);

    return null;
  };

  // Building overlay component
  const BuildingOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !buildingData || !showBuildings) {
        // Remove existing building layer if it exists
        if (buildingLayerRef.current) {
          map.removeLayer(buildingLayerRef.current);
          buildingLayerRef.current = null;
        }
        return;
      }

      console.log("🏠 Adding building overlay...");
      console.log("Building data:", buildingData);

      try {
        // Create building layer
        const buildingLayer = L.geoJSON(buildingData, {
          style: () => ({
            fillColor: "#8B4513", // Brown color for buildings
            weight: 1,
            opacity: 0.8,
            color: "#654321", // Darker brown border
            fillOpacity: 0.7,
          }),
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>🏠 อาคาร</strong><br/>
                <small>พื้นที่: ${
                  props.area_in_me ? props.area_in_me.toFixed(2) : "ไม่ระบุ"
                } ตร.ม.</small><br/>
                <small>ความเชื่อมั่น: ${
                  props.confidence
                    ? (props.confidence * 100).toFixed(1)
                    : "ไม่ระบุ"
                }%</small>
              </div>
            `);
          },
        });

        console.log("🏠 Number of buildings:", buildingData.features.length);

        // Add to map
        buildingLayer.addTo(map);
        buildingLayerRef.current = buildingLayer;
      } catch (error) {
        console.error("🏠 Error adding building overlay:", error);
      }
    }, [map, buildingData, showBuildings]);

    return null;
  };

  // Firebreak overlay component
  const FirebreakOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !firebreakData || !showFirebreaks) {
        // Remove existing firebreak layer if it exists
        if (firebreakLayerRef.current) {
          map.removeLayer(firebreakLayerRef.current);
          firebreakLayerRef.current = null;
        }
        return;
      }

      console.log("🔥 Adding firebreak overlay...");
      console.log("Firebreak data:", firebreakData);

      try {
        // Create firebreak layer
        const firebreakLayer = L.geoJSON(firebreakData, {
          style: () => ({
            color: "#FF4500", // Orange-red color for firebreaks
            weight: 3,
            opacity: 0.8,
            dashArray: "10, 5", // Dotted line style
          }),
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>🔥 แนวกันไฟ</strong><br/>
                <small><strong>หมู่บ้าน:</strong> ${
                  props.Vill_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ประเภท:</strong> ${
                  props.FP_Type || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ความยาว:</strong> ${
                  props.Length ? props.Length.toFixed(2) : "ไม่ระบุ"
                } กม.</small><br/>
                <small><strong>ช่วงเวลา:</strong> ${
                  props.FP_Month || "ไม่ระบุ"
                }</small><br/>
                <small><strong>การจัดการ:</strong> ${
                  props.FP_Manag || "ไม่ระบุ"
                }</small>
              </div>
            `);
          },
        });

        console.log(
          "🔥 Number of firebreak lines:",
          firebreakData.features.length
        );

        // Add to map
        firebreakLayer.addTo(map);
        firebreakLayerRef.current = firebreakLayer;
      } catch (error) {
        console.error("🔥 Error adding firebreak overlay:", error);
      }
    }, [map, firebreakData, showFirebreaks]);

    return null;
  };

  // Fire Sentry Stations overlay component
  const FireSentryOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !fireSentryData || !showFireSentry) {
        if (fireSentryLayerRef.current) {
          map.removeLayer(fireSentryLayerRef.current);
          fireSentryLayerRef.current = null;
        }
        return;
      }

      console.log("🚨 Adding fire sentry stations overlay...");

      try {
        const fireSentryLayer = L.geoJSON(fireSentryData, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#FF6B35",
              color: "#FF4500",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>🚨 ${
                  props.FS_Name || "สถานีเฝ้าระวังไฟป่า"
                }</strong><br/>
                <small><strong>หมู่บ้าน:</strong> ${
                  props.Vill_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ประเภท:</strong> ${
                  props.FS_Type || "ไม่ระบุ"
                }</small><br/>
                <small><strong>เวลาทำงาน:</strong> ${
                  props.FS_Time || "ไม่ระบุ"
                }</small><br/>
                <small><strong>จำนวนคน:</strong> ${
                  props.FS_NumWork || "ไม่ระบุ"
                } คน</small><br/>
                <small><strong>การจัดการ:</strong> ${
                  props.FS_Manag || "ไม่ระบุ"
                }</small>
              </div>
            `);
          },
        });

        fireSentryLayer.addTo(map);
        fireSentryLayerRef.current = fireSentryLayer;
        console.log("✅ Fire sentry stations overlay added");
      } catch (error) {
        console.error("❌ Error adding fire sentry stations overlay:", error);
      }
    }, [map, fireSentryData, showFireSentry]);

    return null;
  };

  // Village Weirs overlay component
  const VillageWeirsOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !villageWeirsData || !showVillageWeirs) {
        if (villageWeirsLayerRef.current) {
          map.removeLayer(villageWeirsLayerRef.current);
          villageWeirsLayerRef.current = null;
        }
        return;
      }

      console.log("💧 Adding village weirs overlay...");

      try {
        const villageWeirsLayer = L.geoJSON(villageWeirsData, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#2196F3",
              color: "#1976D2",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>💧 ${props.VW_Name || "ฝายบ้าน"}</strong><br/>
                <small><strong>หมู่บ้าน:</strong> ${
                  props.Vill_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ประเภท:</strong> ${
                  props.VW_TypWei || "ไม่ระบุ"
                }</small><br/>
                <small><strong>วัสดุ:</strong> ${
                  props.VW_TypMat || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ปริมาณน้ำ:</strong> ${
                  props.VW_QuaWat || "ไม่ระบุ"
                }</small><br/>
                <small><strong>การจัดการ:</strong> ${
                  props.VW_Manag || "ไม่ระบุ"
                }</small>
              </div>
            `);
          },
        });

        villageWeirsLayer.addTo(map);
        villageWeirsLayerRef.current = villageWeirsLayer;
        console.log("✅ Village weirs overlay added");
      } catch (error) {
        console.error("❌ Error adding village weirs overlay:", error);
      }
    }, [map, villageWeirsData, showVillageWeirs]);

    return null;
  };

  // Wildfire Check Points overlay component
  const WildfireCheckOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !wildfireCheckData || !showWildfireCheck) {
        if (wildfireCheckLayerRef.current) {
          map.removeLayer(wildfireCheckLayerRef.current);
          wildfireCheckLayerRef.current = null;
        }
        return;
      }

      console.log("🔍 Adding wildfire check points overlay...");

      try {
        const wildfireCheckLayer = L.geoJSON(wildfireCheckData, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 7,
              fillColor: "#9C27B0",
              color: "#7B1FA2",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div style="font-family: 'DB Helvethaica X', sans-serif;">
                <strong>🔍 จุดตรวจไฟป่า</strong><br/>
                <small><strong>หมู่บ้าน:</strong> ${
                  props.Vill_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>ตำบล:</strong> ${
                  props.Tam_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>อำเภอ:</strong> ${
                  props.Amp_Th || "ไม่ระบุ"
                }</small><br/>
                <small><strong>สถานที่:</strong> ${
                  props.WFC_Loca || "ไม่ระบุ"
                }</small><br/>
                <small><strong>การจัดการ:</strong> ${
                  props.WFC_Manag || "ไม่ระบุ"
                }</small>
              </div>
            `);
          },
        });

        wildfireCheckLayer.addTo(map);
        wildfireCheckLayerRef.current = wildfireCheckLayer;
        console.log("✅ Wildfire check points overlay added");
      } catch (error) {
        console.error("❌ Error adding wildfire check points overlay:", error);
      }
    }, [map, wildfireCheckData, showWildfireCheck]);

    return null;
  };

  // Burn Areas 2024 overlay component
  const BurnAreasOverlay = ({ map }) => {
    useEffect(() => {
      if (!map || !burnAreasData || !showBurnAreas) {
        if (burnAreasLayerRef.current) {
          map.removeLayer(burnAreasLayerRef.current);
          burnAreasLayerRef.current = null;
        }
        return;
      }

      console.log("🔥 Adding burn areas 2024 overlay...");
      console.log(
        `🔥 Processing ${burnAreasData.features.length} burn areas...`
      );

      try {
        // Performance optimization: Filter by map bounds and limit features
        const bounds = map.getBounds();
        const maxFeatures = 5000; // Limit to 5000 features for performance

        let visibleFeatures = burnAreasData.features.filter((feature) => {
          // Check if feature has valid geometry
          if (
            !feature.geometry ||
            !feature.geometry.type ||
            !feature.geometry.coordinates
          ) {
            return false;
          }

          if (
            feature.geometry.type === "Polygon" ||
            feature.geometry.type === "MultiPolygon"
          ) {
            // Check if coordinates array exists and has content
            if (
              !Array.isArray(feature.geometry.coordinates) ||
              feature.geometry.coordinates.length === 0
            ) {
              return false;
            }

            let coords;
            if (feature.geometry.type === "Polygon") {
              // For Polygon: coordinates[0] should be the outer ring
              if (!Array.isArray(feature.geometry.coordinates[0])) {
                return false;
              }
              coords = feature.geometry.coordinates[0];
            } else {
              // For MultiPolygon: coordinates[0][0] should be the first polygon's outer ring
              if (
                !Array.isArray(feature.geometry.coordinates[0]) ||
                !Array.isArray(feature.geometry.coordinates[0][0])
              ) {
                return false;
              }
              coords = feature.geometry.coordinates[0][0];
            }

            // Check if coordinates exist and are valid
            if (!coords || !Array.isArray(coords) || coords.length === 0) {
              return false;
            }

            // Check if any coordinate is within bounds (simplified check)
            return coords.some(
              (coord) =>
                coord &&
                coord.length >= 2 &&
                coord[1] >= bounds.getSouth() &&
                coord[1] <= bounds.getNorth() &&
                coord[0] >= bounds.getWest() &&
                coord[0] <= bounds.getEast()
            );
          }
          return true;
        });

        // If still too many features, take a sample
        if (visibleFeatures.length > maxFeatures) {
          visibleFeatures = visibleFeatures.slice(0, maxFeatures);
        }

        console.log(
          `🔥 Showing ${visibleFeatures.length} burn areas out of ${burnAreasData.features.length} total`
        );

        const burnAreasLayer = L.geoJSON(
          {
            type: "FeatureCollection",
            features: visibleFeatures,
          },
          {
            style: {
              fillColor: "#FF4500", // Orange-red for burn scars
              weight: 0.5, // Very thin borders for performance
              opacity: 0.6, // Reduced opacity
              color: "#FF0000",
              fillOpacity: 0.3, // Lower fill opacity
            },
            // Disable interactivity for better performance
            interactive: false,
          }
        );

        burnAreasLayer.addTo(map);
        burnAreasLayerRef.current = burnAreasLayer;
        console.log(
          "✅ Burn areas 2024 overlay added with performance optimizations"
        );
      } catch (error) {
        console.error("❌ Error adding burn areas 2024 overlay:", error);
      }
    }, [map, burnAreasData, showBurnAreas]);

    return null;
  };

  // Custom hook to access map instance
  const useMapInstance = () => {
    const map = useMap();
    return map;
  };

  const MapWithOverlays = () => {
    const map = useMapInstance();
    return (
      <>
        <ForestOverlay map={map} />
        <FirebreakOverlay map={map} />
        <FuelManagementOverlay map={map} />
        <BuildingOverlay map={map} />
        <FireSentryOverlay map={map} />
        <VillageWeirsOverlay map={map} />
        <WildfireCheckOverlay map={map} />
        <BurnAreasOverlay map={map} />
      </>
    );
  };

  const handlePolygonClick = (village) => {
    if (onVillageSelect) {
      onVillageSelect(village);
    }
  };

  // Get polygon style based on selection and status
  const getPolygonStyle = (village, isSelected = false, isDimmed = false) => {
    const baseColor = getPolygonColor(village);

    if (isSelected) {
      return {
        fillColor: "transparent", // No fill color for selected village
        fillOpacity: 0, // Completely transparent fill
        color: "#FFD700", // Bright gold border for selected village
        weight: 6,
        opacity: 1,
        dashArray: "0", // Solid line for selected
      };
    }

    if (isDimmed) {
      // Dim other villages when one is selected
      return {
        fillColor: baseColor,
        fillOpacity: 0,
        color: baseColor,
        weight: 1,
        opacity: 0.1,
      };
    }

    // Normal state - reduce opacity for villages without plans (red polygons)
    const fillOpacity = village.status.hasPlan ? 0.6 : 0.1;
    const borderOpacity = village.status.hasPlan ? 0.8 : 0.1;

    return {
      fillColor: baseColor,
      fillOpacity: fillOpacity,
      color: baseColor,
      weight: 2,
      opacity: borderOpacity,
    };
  };

  if (loading) {
    return (
      <Center height="100%" width="100%">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.orange" />
          <Text>กำลังโหลดข้อมูลหมู่บ้าน...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="100%" width="100%">
        <VStack spacing={4}>
          <Text color="red.500" fontSize="lg">
            เกิดข้อผิดพลาด
          </Text>
          <Text color="gray.600">{error}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box height="100%" width="100%" position="relative">
      <MapContainer
        center={[18.8, 99.1]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          key={currentBasemap}
          attribution={TILE_ATTRIBUTIONS[currentBasemap]}
          url={TILE_URLS[currentBasemap]}
        />

        <MapController
          selectedVillage={selectedVillage}
          onZoomChange={setCurrentZoom}
        />
        <MapWithOverlays />

        {villages.map((village) => {
          const coordinates = convertCoordinates(
            village.gisData.geometry.coordinates
          );

          if (coordinates.length === 0) return null;

          const isSelected =
            selectedVillage && selectedVillage.id === village.id;
          const isDimmed = selectedVillage && !isSelected; // Dim if another village is selected

          return (
            <Polygon
              key={village.id}
              ref={(ref) => {
                if (ref) {
                  polygonRefs.current[village.id] = ref;
                }
              }}
              positions={coordinates}
              pathOptions={getPolygonStyle(village, isSelected, isDimmed)}
              eventHandlers={{
                click: () => handlePolygonClick(village),
                mouseover: (e) => {
                  if (!isSelected && !isDimmed) {
                    const hoverOpacity = village.status.hasPlan ? 0.8 : 0.3;
                    const baseColor = getPolygonColor(village);
                    e.target.setStyle({
                      fillColor: baseColor,
                      fillOpacity: hoverOpacity,
                      color: baseColor,
                      weight: 3,
                      opacity: 0.8,
                    });
                  } else if (isDimmed) {
                    // Slightly brighten dimmed villages on hover
                    const baseColor = getPolygonColor(village);
                    e.target.setStyle({
                      fillColor: baseColor,
                      fillOpacity: 0.3,
                      color: baseColor,
                      opacity: 0.4,
                    });
                  }
                },
                mouseout: (e) => {
                  if (!isSelected) {
                    // Force complete style reset to prevent stuck hover effects
                    const baseColor = getPolygonColor(village);

                    if (isDimmed) {
                      // Return to dimmed state - complete reset
                      e.target.setStyle({
                        fillColor: baseColor,
                        fillOpacity: 0,
                        color: baseColor,
                        weight: 1,
                        opacity: 0.1,
                      });
                    } else {
                      // Return to normal state - complete reset
                      const normalOpacity = village.status.hasPlan ? 0.6 : 0.1;
                      const normalBorderOpacity = village.status.hasPlan
                        ? 0.8
                        : 0.1;
                      e.target.setStyle({
                        fillColor: baseColor,
                        fillOpacity: normalOpacity,
                        color: baseColor,
                        weight: 2,
                        opacity: normalBorderOpacity,
                      });
                    }
                  }
                },
              }}
            >
              <LeafletTooltip
                permanent={false}
                direction="top"
                offset={[0, -10]}
                className="village-tooltip"
              >
                <div
                  style={{
                    fontFamily: '"DB Helvethaica X", sans-serif',
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#2F4858",
                    textAlign: "center",
                    padding: "2px 6px",
                    backgroundColor: "white",
                    border: "1px solid #F47B20",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {village.name}
                  {village.status.hasPlan && (
                    <span style={{ color: "#4CAF50", marginLeft: "4px" }}>
                      ✅
                    </span>
                  )}
                </div>
              </LeafletTooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Basemap Selector */}
      <BasemapSelector
        currentBasemap={currentBasemap}
        onBasemapChange={setCurrentBasemap}
      />

      {/* Interactive Map Legend */}
      <Box
        position="absolute"
        bottom={7}
        right={4}
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="lg"
        zIndex={1000}
        fontSize="sm"
        maxWidth="280px"
      >
        <Text fontWeight="bold" mb={2}>
          🗺️ สัญลักษณ์แผนที่
        </Text>

        {/* Village Status Legend */}
        <VStack align="start" spacing={1} mb={3}>
          <Text fontSize="xs" fontWeight="bold" color="gray.600">
            หมู่บ้าน:
          </Text>
          <HStack>
            <Box w={4} h={4} bg="#5ab14c" borderRadius="sm" />
            <Text fontSize="xs">มีแผนแล้ว</Text>
          </HStack>
          <HStack>
            <Box w={4} h={4} bg="#F47B20" borderRadius="sm" />
            <Text fontSize="xs">ยังไม่มีแผน</Text>
          </HStack>
          {selectedVillage && (
            <HStack>
              <Box
                w={4}
                h={4}
                border="3px solid #FFD700"
                bg="transparent"
                borderRadius="sm"
              />
              <Text fontSize="xs" color="gray.600">
                หมู่บ้านที่เลือก
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Interactive Layer Controls */}
        <Box my={2} height="1px" bg="gray.300" />
        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
          ชั้นข้อมูล (คลิกเพื่อเปิด/ปิด):
        </Text>

        {/* Forest Types */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("forestTypes")}
          opacity={!forestTypes ? 0.5 : 1}
          bg={userLayerPreferences.forestTypes ? "green.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={forestTypes ? { bg: "green.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🌲
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.forestTypes ? "bold" : "normal"}
          >
            ประเภทป่าไม้
          </Text>
          {!forestTypes && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {showForestTypes && (
          <VStack align="start" spacing={1} fontSize="xs" ml={4} mb={2}>
            <HStack>
              <Box w={3} h={3} bg="#0D4F3C" borderRadius="sm" />
              <Text>ป่าดิบเขา</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#2F855A" borderRadius="sm" />
              <Text>ป่าดิบแล้ง</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#68D391" borderRadius="sm" />
              <Text>ป่าเต็งรัง</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#38A169" borderRadius="sm" />
              <Text>ป่าเบญจพรรณ</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#D69E2E" borderRadius="sm" />
              <Text>สวนป่าสัก</Text>
            </HStack>
          </VStack>
        )}

        {/* Firebreaks */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("firebreaks")}
          opacity={!firebreakData ? 0.5 : 1}
          bg={userLayerPreferences.firebreaks ? "orange.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={firebreakData ? { bg: "orange.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🔥
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.firebreaks ? "bold" : "normal"}
          >
            แนวกันไฟ
          </Text>
          {!firebreakData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {showFirebreaks && (
          <VStack align="start" spacing={1} fontSize="xs" ml={4} mb={2}>
            <HStack>
              <Box w={3} h="1px" bg="#FF4500" border="1px dashed #FF4500" />
              <Text>แนวกันไฟป่า</Text>
            </HStack>
          </VStack>
        )}

        {/* Fuel Management */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("fuelManagement")}
          opacity={!fuelManagementData ? 0.5 : 1}
          bg={userLayerPreferences.fuelManagement ? "yellow.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={fuelManagementData ? { bg: "yellow.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🔧
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.fuelManagement ? "bold" : "normal"}
          >
            จัดการเชื้อเพลิง
          </Text>
          {!fuelManagementData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {showFuelManagement && (
          <VStack align="start" spacing={1} fontSize="xs" ml={4} mb={2}>
            <HStack>
              <Box w={3} h={3} bg="#FF6B35" borderRadius="sm" />
              <Text>ชิงเผา</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#4CAF50" borderRadius="sm" />
              <Text>ป้องกันไฟ</Text>
            </HStack>
            <HStack>
              <Box w={3} h={3} bg="#2E7D32" borderRadius="sm" />
              <Text>ปลูกเสริมป่า</Text>
            </HStack>
          </VStack>
        )}

        {/* Fire Sentry */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("fireSentry")}
          opacity={!fireSentryData ? 0.5 : 1}
          bg={userLayerPreferences.fireSentry ? "purple.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={fireSentryData ? { bg: "purple.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🚨
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.fireSentry ? "bold" : "normal"}
          >
            ด่านเฝ้าไฟ
          </Text>
          {!fireSentryData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {/* Village Weirs */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("villageWeirs")}
          opacity={!villageWeirsData ? 0.5 : 1}
          bg={userLayerPreferences.villageWeirs ? "blue.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={villageWeirsData ? { bg: "blue.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            💧
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.villageWeirs ? "bold" : "normal"}
          >
            ฝายน้ำ
          </Text>
          {!villageWeirsData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {/* Wildfire Check */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("wildfireCheck")}
          opacity={!wildfireCheckData ? 0.5 : 1}
          bg={userLayerPreferences.wildfireCheck ? "teal.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={wildfireCheckData ? { bg: "teal.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🔍
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.wildfireCheck ? "bold" : "normal"}
          >
            จุดตรวจไฟ
          </Text>
          {!wildfireCheckData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
        </HStack>

        {/* Buildings */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("buildings")}
          opacity={!buildingData ? 0.5 : 1}
          bg={userLayerPreferences.buildings ? "orange.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={buildingData ? { bg: "orange.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🏠
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.buildings ? "bold" : "normal"}
          >
            อาคาร
          </Text>
          {!buildingData && (
            <Text fontSize="xs" color="gray.400">
              (เลือกหมู่บ้าน)
            </Text>
          )}
          {buildingData && (
            <Text fontSize="xs" color="gray.600">
              ({buildingData.features.length} หลัง)
            </Text>
          )}
        </HStack>

        {/* Burn Areas */}
        <HStack
          cursor="pointer"
          onClick={() => toggleLayer("burnAreas")}
          opacity={!burnAreasData ? 0.5 : 1}
          bg={userLayerPreferences.burnAreas ? "red.50" : "transparent"}
          p={1}
          borderRadius="md"
          _hover={burnAreasData ? { bg: "red.100" } : {}}
          mb={1}
        >
          <Text fontSize="xs" mr={2}>
            🔥
          </Text>
          <Text
            fontSize="xs"
            fontWeight={userLayerPreferences.burnAreas ? "bold" : "normal"}
          >
            ไฟไหม้ 2024
          </Text>
          {!burnAreasData && (
            <Text fontSize="xs" color="gray.400">
              (ไม่มีข้อมูล)
            </Text>
          )}
          {burnAreasData && (
            <Text fontSize="xs" color="gray.600">
              ({burnAreasData.features.length.toLocaleString()} พื้นที่)
            </Text>
          )}
        </HStack>

        {showBurnAreas && (
          <VStack align="start" spacing={1} fontSize="xs" ml={4} mb={2}>
            <HStack>
              <Box w={3} h={3} bg="#FF4500" borderRadius="sm" />
              <Text>รอยไฟไหม้</Text>
            </HStack>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default Map;
