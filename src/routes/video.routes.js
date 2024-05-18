import express from "express";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWToken } from "../middlewares/auth.middleware.js";

import{
    deleteVideo,
    getAllVideos,
    getVideoByID,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js";

let router = express.Router();

router.use(verifyJWToken);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },

        ]),
        publishAVideo
    );

router
    .route("/:videoID")
    .get(getVideoByID)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoID").patch(togglePublishStatus);

export default router




