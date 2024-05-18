import express from "express";
import { verifyJWToken } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
const router = express.Router();

router.use(verifyJWToken);

router.route("/").post(createPlaylist);

router
  .route("/:playlistID")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoID/:playlistID").patch(addVideoToPlaylist);
router.route("/remove/:videoID/:playlistID").patch(removeVideoFromPlaylist);

router.route("/user/:userID").get(getUserPlaylists);

export default router;
