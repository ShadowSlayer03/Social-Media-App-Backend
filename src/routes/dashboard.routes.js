import express from "express";
import { verifyJWToken } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

let router = express.Router();

router.use(verifyJWToken);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;