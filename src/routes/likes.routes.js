import express from "express";
import { verifyJWToken } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleTweetLike,
  toggleCommentLike,
  getLikedVideos,
} from "../controllers/likes.controller.js";

const router = express.Router();

router.use(verifyJWToken);

router.route("/toggle/v/:videoID").post(toggleVideoLike);
router.route("/toggle/t/:tweetID").post(toggleTweetLike);
router.route("/toggle/c/:commentID").post(toggleCommentLike);
router.route("/videos").get(getLikedVideos);

export default router;
