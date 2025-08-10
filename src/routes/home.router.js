import { Router } from "express";
import { getAirQuality } from "../controllers/home.controller.js";
// import { createAirQualityData } from "../controllers/openaqClient.js";

const router = Router();

router.route('/air-quality').get(getAirQuality);
// router.route('/create-csv').post(createAirQualityData)

export default router;