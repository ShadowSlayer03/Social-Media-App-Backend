import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getUserTweets = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  if (!userID || !isValidObjectId(userID)) {
    throw new ApiError(400, "User ID Not Found Or Invalid!");
  }

  let user = await User.findById(userID);

  if(!user){
    throw new ApiError(404,"User Not Found!");
  }

  let tweets = await Tweet.find({ owner: userID }).sort({ createdAt: -1 });

  if (tweets.length === 0) {
    return res.status(404).json({ message: "No Tweets Found!" });
  }

  res
    .status(200)
    .json(new ApiResponse(201, { message: "Tweets Found!", data: tweets }));
});

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  if (!content) {
    throw new ApiError(400, "Tweet Content is Required!");
  }

  if (!user) {
    throw new ApiError(400, "User Not Found!");
  }

  const newTweet = await Tweet.create({
    content,
    owner: user._id,
  });

  if (!newTweet) {
    throw new ApiError(500, "Tweet could not be Created!");
  }

  res
    .status(201)
    .json({ message: "Tweet Created Successfully!", tweet: newTweet });
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetID } = req.params;
  const user = req.user;
  const { content } = req.body;

  if (!user) {
    throw new ApiError(400, "User Not Found!");
  }

  if (!tweetID || !isValidObjectId(tweetID)) {
    throw new ApiError(400, "Tweet ID Not Found Or Invalid!");
  }

  if(!content || content.length===0){
    throw new ApiError(400,"Content Must be Provided to Update Tweet!")
  }

  const tweetToUpdate = await Tweet.findById(tweetID);

  if (!tweetToUpdate) {
    throw new ApiError(404, "Tweet to be Updated Not Found!");
  }

  if (!tweetToUpdate.owner.equals(user._id)) {
    throw new ApiError(403, "Unauthorized to update this tweet!");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetID,
    { content },
    { runValidators: true, new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Tweet Could Not be Updated!");
  }

  res
    .status(200)
    .json({ message: "Tweet Updated Successfully!", tweet: updatedTweet });
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetID } = req.params;
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User Not Found!");
  }

  if (!tweetID || !isValidObjectId(tweetID)) {
    throw new ApiError(400, "Tweet ID Not Found Or Invalid!");
  }

  let userTweet = await Tweet.findById(tweetID);

  if (!userTweet) {
    throw new ApiError(404, "Tweet Not Found!");
  }

  if (!userTweet.owner.equals(user._id)) {
    throw new ApiError(403, "Unauthorized to delete this tweet!");
  }

  let deletedTweet = await Tweet.deleteOne({ _id: tweetID });

  if (deletedTweet.deletedCount === 0) {
    throw new ApiError(500, "Tweet Could Not be Deleted!");
  }

  res.status(200).json({ message: "Tweet Deleted Successfully!" });
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
