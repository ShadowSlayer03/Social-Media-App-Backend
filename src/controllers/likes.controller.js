import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoID } = req.params;

  if (!user) {
    throw new ApiError(400, "User Could Not be Authenticated!");
  }

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID Invalid or Could Not be Found!");
  }

  let videoDoc = await Video.findById(videoID);

  if(!videoDoc){
    throw new ApiError(404,"No Such Video Document Found!");
  }

  let reqDocument = await Like.find({ likedBy: user._id, video: videoID });

  if (reqDocument.length === 0) {
    let newLikeDocument = await Like.create({
      likedBy: user._id,
      video: videoID,
    });

    if (!newLikeDocument) {
      throw new ApiError(500, "Video Like Document Could Not be Created!");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "New Video Like Document Created Successfully!")
      );
  } else {
    let result = await Like.deleteOne({ likedBy: user._id, video: videoID });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json(
          new ApiResponse(200, "Video Like Document Deleted Successfully!")
        );
    } else {
      throw new ApiError(501, "Document Was Not Deleted Successfully!");
    }
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const user = req.user;
  const { commentID } = req.params;

  if (!user) {
    throw new ApiError(400, "User Could Not be Authenticated!");
  }

  if (!commentID || !isValidObjectId(commentID)) {
    throw new ApiError(400, "Comment ID Invalid or Could Not be Found!");
  }

  let commentDoc = await Comment.findById(commentID);

  if(!commentDoc){
    throw new ApiError(404,"No Such Comment Document Found!");
  }

  let reqDocument = await Like.find({ likedBy: user._id, comment: commentID });

  if (reqDocument.length === 0) {
    let newLikeDocument = await Like.create({
      likedBy: user._id,
      comment: commentID,
    });

    if (!newLikeDocument) {
      throw new ApiError(500, "Comment Like Document Could Not be Created!");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "New Comment  Like Document Created Successfully!")
      );
  } else {
    let result = await Like.deleteOne({
      likedBy: user._id,
      comment: commentID,
    });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json(
          new ApiResponse(200, "Comment Like Document Deleted Successfully!")
        );
    } else {
      throw new ApiError(501, "Comment Document Was Not Deleted Successfully!");
    }
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tweetID } = req.params;

  if (!user) {
    throw new ApiError(400, "User Could Not be Authenticated!");
  }

  if (!tweetID || !isValidObjectId(tweetID)) {
    throw new ApiError(400, "Tweet ID Invalid or Could Not be Found!");
  }

  let tweetDoc = await Tweet.findById(tweetID);

  if(!tweetDoc){
    throw new ApiError(404,"No Such Tweet Document Found!");
  }

  let reqDocument = await Like.find({ likedBy: user._id, tweet: tweetID });

  if (reqDocument.length === 0) {
    let newLikeDocument = await Like.create({
      likedBy: user._id,
      tweet: tweetID,
    });

    if (!newLikeDocument) {
      throw new ApiError(500, "Tweet Like Document Could Not be Created!");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "New Tweet Like Document Created Successfully!")
      );
  } else {
    let result = await Like.deleteOne({ likedBy: user._id, tweet: tweetID });

    if (result.deletedCount === 1) {
      res
        .status(200)
        .json(
          new ApiResponse(200, "Tweet Like Document Deleted Successfully!")
        );
    } else {
      throw new ApiError(501, "Document Was Not Deleted Successfully!");
    }
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User Could Not be Authenticated!");
  }

  let likedDocuments = await Like.find({ likedBy: user._id });

  if (!likedDocuments || likedDocuments.length === 0) {
    res.status(200).json(new ApiResponse(201,"No User Liked Documents Found!"))
  }

  res
    .status(200)
    .json(new ApiResponse(200, likedDocuments, "User Liked Documents Found!"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
