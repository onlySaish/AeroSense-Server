import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

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
                console.warn(`Failed to fetch sensor ${sensorId}`);
                return;
              }
            }

            const param = sensorInfo?.parameter?.name?.toUpperCase();
            const unit = sensorInfo?.parameter?.units || m.unit || "";

            if (param && m.value !== undefined) {
              const roundedValue = Number(m.value).toFixed(2); 
              pollutants[param] = `${roundedValue} ${unit}`;
            }
          })
        );

        allData.push({
          location: loc.name,
          coordinates: loc.coordinates,
          pollutants,
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

    return res.status(200).json(
      new ApiResponse(200, allData, "Fetched air quality data successfully")
    );
  } catch (err) {
    console.error("OpenAQ error:", err?.response?.data || err.message);
    throw new ApiError(500, "Failed to fetch measurements from OpenAQ.");
  }
});

export { getAirQuality };