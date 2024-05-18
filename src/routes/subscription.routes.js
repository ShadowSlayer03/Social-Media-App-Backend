import {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import express from "express";
import {verifyJWToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWToken);

router.route("/u/:subscriberID").get(getSubscribedChannels);
router.route("/c/:channelID").get(getChannelSubscribers).post(toggleSubscription);

export default router;