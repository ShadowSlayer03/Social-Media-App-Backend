import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes on videos,
  // total playlists, total comments from all videos.

  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User Authentication Failed!");
  }

  
  try {
    var totalVideoViews = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(user._id), // Convert string to ObjectId
        },
      },
      {
        $group: {
          _id: "$owner",
          totalViews: {
            $sum: "$views",
          },
        },
      },
    ]);

    if (totalVideoViews.length===0) {
      console.log("No Videos Found For the User!");
    }

    if (totalVideoViews[0]?.totalViews===0) {
      console.log("No Views Found For the Videos!");
    }

  } catch (error) {
    throw new ApiError(
      500,
      "Total Channel Views Could Not be Found! - Aggregation Error"
    );
  }

  try {
    var totalSubscriberCount = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $count: "totalSubsCount",
      },
    ]);

    if (totalSubscriberCount.length===0 || totalSubscriberCount.totalSubsCount===0) {
      console.log("No Subscribers Found For the User!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Total Subscriber Count Could Not be Found! - Aggregation Error"
    );
  }

  try {
    var totalVideoCount = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $count: "totalVidCount",
      },
    ]);

    if (totalVideoCount.length===0 || totalVideoCount[0].totalVidCount===0) {
      console.log("No Videos Found For the User!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Total Video Count Could Not be Found! - Aggregation Error"
    );
  }

  let videoIds = await Video.find({
    owner: new mongoose.Types.ObjectId(user._id),
  })
    .select("_id") // Select only the _id field
    .lean() // Convert the Mongoose Documents into plain JavaScript objects
    .exec(); // Execute the query

  try {
    var totalLikesCount = await Like.aggregate([
      {
        $match: {
          video: {
            $in: videoIds.map((video) => video._id), // Now you can use .map
          },
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: {
            $sum: 1,
          },
        },
      },
    ]);

    if(totalLikesCount.length===0 || totalLikesCount.totalLikes===0){
      console.log("No Likes Were Found on User Videos!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Total Likes On User Videos Could Not be Found! - Aggregation Error"
    );
  }


  try {
    var totalPlaylistsCount = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $count: "totalPlayList",
      },
    ]);

    if(totalPlaylistsCount.length===0 || totalPlaylistsCount.totalPlayList===0){
      console.log("No User Playlists Found!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Total PlayList Count Could Not be Found! - Aggregation Error"
    );
  }

  try {
    var totalCommentCount = await Comment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $count: "totalComment",
      },
    ]);

    if(totalCommentCount.length===0 || totalCommentCount.totalComment===0){
      console.log("No User Comments Found!");
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Total Comment Count Could Not be Found! - Aggregation Error"
    );
  }

  const reqData = [
    totalVideoViews[0],
    totalSubscriberCount,
    totalVideoCount,
    totalLikesCount,
    totalPlaylistsCount,
    totalCommentCount,
  ];

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        totalVideoViews,
        reqData,
        "Required Documents Found!"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(200, "User Can Not be Authenticated!");
  }

  let userVidDocuments = await Video.find({ owner: user._id });

  if (!userVidDocuments) {
    res.status(404).json(new ApiResponse(200, "No User Videos Found!"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, userVidDocuments, "User Videos Found!"));
});

export { getChannelStats, getChannelVideos };
