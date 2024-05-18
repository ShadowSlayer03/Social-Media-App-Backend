import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (videoID.length === 0 || !isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID Not Found Or Invalid!");
  }

  const videoFetched = await Video.findById(videoID);

  if (!videoFetched) {
    throw new ApiError(404, "Video Not Found!");
  }

  const totalComments = await Comment.countDocuments({
    video: videoFetched._id,
  });

  // Add .sort({ createdAt: -1 }) to sort comments in descending order by createdAt
  const comments = await Comment.find({ video: videoFetched._id })
    .sort({ createdAt: -1 }) // This line sorts the comments
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const response = {
    data: comments,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalComments / limit),
    totalComments,
  };

  const message =
    comments.length === 0 ? "No Comments Found!" : "Comments Found!";
  res.status(200).json(new ApiResponse(200, response, message));
});

export const addComment = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const user = req.user;
  const { commentContent } = req.body;

  if (!user) {
    throw new ApiError(401, "User Not Found!");
  }

  if (commentContent.length===0) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID Not Found Or Invalid!");
  }

  const videoFetched = await Video.findById(videoID);

  if (!videoFetched) {
    throw new ApiError(404, "Video Not Found!");
  }

  const newCommentDoc = new Comment({
    video: videoID,
    owner: user._id,
    content: commentContent,
  });
  await newCommentDoc.save();

  res.status(201).json(new ApiResponse(201, "New Comment Added Successfully!"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentID } = req.params;

  if (!commentID || !isValidObjectId(commentID)) {
    throw new ApiError(400, "Comment ID Not Found Or Invalid!");
  }

  try {
    const result = await Comment.findByIdAndDelete(commentID);

    if (result) {
      res
        .status(200)
        .json(new ApiResponse(200, result, "Comment Deleted Successfully!"));
    }
  } catch (error) {
    throw new ApiError(500,`Could Not Delete the Comment! - ${error}`);
  }
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentID } = req.params;
  const { commentContent } = req.body;
  const user = req.user;

  if (!commentID || !isValidObjectId(commentID)) {
    throw new ApiError(400, "Comment ID Not Found Or Invalid!");
  }

  if (!commentContent || commentContent.length===0) {
    throw new ApiError(401, "Comment Not Provided!");
  }

  try {
    const comment = await Comment.findById(commentID);
    if (!comment) {
      throw new ApiError(404, "Comment Not Found!");
    }

    if (comment.owner.toString() !== user._id.toString()) {
      throw new ApiError(400, "User is not the Comment Owner!");
    }

    comment.content = commentContent;
    await comment.save();

    res.status(200).json(new ApiResponse(200, "Comment Updated Successfully!"));
  } catch (error) {
    throw new ApiError(500, `Comment Could Not be Updated! - ${error}`);
  }
});
