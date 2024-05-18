import {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment
} from "../controllers/comment.controller.js";
import express from "express";
import { verifyJWToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWToken);

router.route("/:videoID").get(getVideoComments).post(addComment);
router.route("/c/:commentID").delete(deleteComment).patch(updateComment);

export default router;