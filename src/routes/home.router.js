import { Router } from "express";
import { getAirQuality } from "../controllers/home.controller.js";

const router = Router();

router.route('/air-quality').get(getAirQuality);

export default router;