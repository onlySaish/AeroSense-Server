import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import { writeDataToCSV } from "../utils/csvWriter.js";

const OPENAQ_API_KEY = process.env.OPENAQ_API_KEY;
const BASE_LOCATIONS = 'https://api.openaq.org/v3/locations';
const BASE_LATEST = (id) => `https://api.openaq.org/v3/locations/${id}/latest`;
const SENSOR_API = (sensorId) => `https://api.openaq.org/v3/sensors/${sensorId}`;

const getAirQuality = asyncHandler(async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) throw new ApiError(400, "Latitude and Longitude are required.");

  const sensorCache = new Map();

  try {
    // Step 1: Get nearby locations
    const locRes = await axios.get(BASE_LOCATIONS, {
      params: {
        coordinates: `${lat},${lon}`,
        radius: 5000,
        limit: 5,
      },
      headers: { 'X-API-Key': OPENAQ_API_KEY },
    });

    const locations = locRes.data.results;
    if (!locations.length) {
      return res.status(200).json(
        new ApiResponse(200, [], "No stations found nearby")
      );
    }

    console.log(locations);
    

    // Step 2: Get measurements for each location
    const allData = [];

    await Promise.all(
      locations.map(async (loc) => {
        const latestRes = await axios.get(BASE_LATEST(loc.id), {
          headers: { 'X-API-Key': OPENAQ_API_KEY },
        });

        const measurements = latestRes.data.results || [];
        const pollutants = {};

        await Promise.all(
          measurements.map(async (m) => {
            const sensorId = m.sensorsId;
            if (!sensorId) return;

            let sensorInfo;
            if (sensorCache.has(sensorId)) {
              sensorInfo = sensorCache.get(sensorId);
            } else {
              try {
                const sensorRes = await axios.get(SENSOR_API(sensorId), {
                  headers: { 'X-API-Key': OPENAQ_API_KEY },
                });
                sensorInfo = sensorRes.data?.results?.[0]; 
                sensorCache.set(sensorId, sensorInfo);
              } catch (err) {
                // console.warn(`Failed to fetch sensor ${sensorId}`);
                return;
              }
            }

            const param = sensorInfo?.parameter?.name?.toUpperCase();
            const unit = sensorInfo?.parameter?.units || m.unit || "";

            // Skip temperature and relative humidity
            if (param === "TEMPERATURE" || param === "RELATIVEHUMIDITY") {
              pollutants[param] = `${m.value} ${unit}`;
            } else if (param && m.value !== undefined) {
              const ugValue = toUgPerM3(m.value, unit, param);
              if (ugValue !== null) {
                pollutants[param] = `${ugValue.toFixed(2)} µg/m³`;
              }
            }
          })
        );

        allData.push({
          location: loc.name,
          coordinates: loc.coordinates,
          pollutants,
          datetimeLast: loc.datetimeLast?.local
        });
      })
    );

    const allParameters = new Set();

    allData.forEach(loc => {
      Object.keys(loc.pollutants).forEach(param => allParameters.add(param));
    });

    allData.forEach(loc => {
      allParameters.forEach(param => {
        if (!(param in loc.pollutants)) {
          loc.pollutants[param] = null;
        }
      });
    });

    // Write to CSV
    if (allData.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No measurements found for nearby locations")
      );
    }
    await writeDataToCSV(allData);

    return res.status(200).json(
      new ApiResponse(200, allData, "Fetched air quality data successfully")
    );
  } catch (err) {
    console.error("OpenAQ error:", err?.response?.data || err.message);
    throw new ApiError(500, "Failed to fetch measurements from OpenAQ.");
  }
});

// Standardize pollutant values to µg/m³
const MW = { // Molecular weights (g/mol)
  'CO': 28.01,
  'NO2': 46.01,
  'O3': 48.00,
  'SO2': 64.07,
  'PM2.5': 1, // Already in µg/m³
  'PM10': 1,  // Already in µg/m³
};

function toUgPerM3(value, unit, param) {
  if (value === undefined || value === null || !unit || !param) return null;
  param = param.toUpperCase();
  if (unit === 'µg/m³' || unit === 'ug/m3') return Number(value);
  if (unit === 'mg/m³' || unit === 'mg/m3') return Number(value) * 1000;
  if (unit === 'ppm' && MW[param]) return Number(value) * MW[param] * 40.9;
  if (unit === 'ppb' && MW[param]) return Number(value) * MW[param] * 0.0409;
  return null; 
}

export { getAirQuality };