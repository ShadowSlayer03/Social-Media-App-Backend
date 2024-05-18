import express from 'express';
import { loginUser, logoutUser, registerUser, renewAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImg, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWToken} from '../middlewares/auth.middleware.js'
const router = express.Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWToken, logoutUser)

router.route("/refresh-token").post(renewAccessToken);

router.route("/change-password").post(verifyJWToken,changePassword);

router.route("/update-account").patch(verifyJWToken, updateAccountDetails);

router.route("/current-user").get(verifyJWToken, getCurrentUser);

router.route("/avatar").patch(verifyJWToken,upload.single("avatar"), updateUserAvatar);

router.route("/cover-image").patch(verifyJWToken,upload.single("cover-image"), updateUserCoverImg);

router.route("/channel/:username").get(verifyJWToken,getUserChannelProfile);

router.route("/history").get(verifyJWToken,getWatchHistory);

export default router;