import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  let matchStage = {
    isPublished: true,
  };

  if (userId && isValidObjectId(userId)) {
    matchStage.owner = new mongoose.Schema.Types.ObjectId(userId);
  }

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } }, // Case-insensitive search in title
      { description: { $regex: query, $options: "i" } }, // Case-insensitive search in description
    ];
  }

  let sortStage = {};
  sortStage[sortBy] = sortType === "asc" ? 1 : -1;

  const aggregateQuery = [{ $match: matchStage }, { $sort: sortStage }];

  const options = {
    page,
    limit: parseInt(limit),
    customLabels: {
      // Custom labels for the pagination results
      totalDocs: "totalResults",
      docs: "videos",
      limit: "pageSize",
      page: "currentPage",
      totalPages: "pageCount",
    },
  };

  const result = await Video.aggregatePaginate(
    Video.aggregate(aggregateQuery),
    options
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "Videos Fetched Successfully!"));
});

const getVideoByID = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID Invalid or Not Found!");
  }

  let video = await Video.findById(videoID);

  if (!video) {
    throw new ApiError(404, "Video Not Found!");
  }

  res.status(200).json(new ApiResponse(200, video, "Video Found!"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  if (!user) {
    throw new ApiError(500, "User Could Not be Authenticated!");
  }

  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "One or More Required Parameters not Provided!");
  }

  const { videoFile, thumbnail } = req.files;

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Required Video or Thumbnail Not Provided!");
  }

  console.log("VIDEOFILE:", videoFile, "THUMBNAIL:", thumbnail);

  try {
    const res1 = await uploadOnCloudinary(videoFile[0].path);
    const res2 = await uploadOnCloudinary(thumbnail[0].path);

    const result = await Video.create({
      videoFile: res1.url,
      thumbnail: res2.url,
      owner: user._id,
      title,
      description,
      views: 0,
      isPublished: true,
    });

    if (!result)
      throw new ApiError(501, "Could not Create Video Document in DB!");

    res
      .status(200)
      .json(new ApiResponse(200, result, "Video Published Successfully!"));
  } catch (error) {
    throw new ApiError(500, "An Error Occurred While Publishing the Video!");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(400, "VideoID Invalid or Not Found!");
  }

  let video = await Video.findById(videoID);

  if (!video) {
    throw new ApiError(404, "Video Not Found!");
  }

  video.isPublished = !video.isPublished;

  await video.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Toggle Publish Status Successful!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(400, "VideoID Invalid or Not Found!");
  }

  let deletedVideo = await Video.findByIdAndDelete(videoID);

  if (!deletedVideo) {
    throw new ApiError(402, "Video Could Not Be Deleted!");
  }

  try {
    let res1 = await deleteFromCloudinary(deletedVideo.videoFile);
    if (res1) console.log("Video Deleted from Cloudinary Successfully!");
    let res2 = await deleteFromCloudinary(deletedVideo.thumbnail);
    if (res2) console.log("Thumbnail Deleted from Cloudinary Successfully!");
  } catch (error) {
    throw new ApiError(
      500,
      `Error Deleting Assets from Cloudinary! - ${error}`
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video Deleted Successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const { thumbnail, title, description } = req.body;

  if (!videoID || !mongoose.Types.ObjectId.isValid(videoID)) {
    throw new ApiError(400, "VideoID Invalid or Not Found!");
  }

  if (!thumbnail && !title && !description) {
    throw new ApiError(400, "Missing All Update Parameters!");
  }

  const update = {};
  if (thumbnail) update.thumbnail = thumbnail;
  if (title) update.title = title;
  if (description) update.description = description;

  let video = await Video.findByIdAndUpdate(videoID, update, {
    new: true,
    runValidators: true,
  });

  if (!video) {
    throw new ApiError(404, "No Video Found!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Document Updated Successfully!"));
});

export {
  deleteVideo,
  getAllVideos,
  getVideoByID,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
};
