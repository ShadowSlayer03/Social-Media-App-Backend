import express from "express";
import getHealth from "../controllers/healthcheck.controller.js"

const router = express.Router();

router.route("/health").get(getHealth);

export default router;