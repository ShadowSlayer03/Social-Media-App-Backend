import express from "express";
import { verifyJWToken } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweets.controller.js"

let router = express.Router();
router.use(verifyJWToken);

router.route("/").post(createTweet);
router.route("/user/:userID").get(getUserTweets);
router.route("/:tweetID").patch(updateTweet).delete(deleteTweet);

export default router;