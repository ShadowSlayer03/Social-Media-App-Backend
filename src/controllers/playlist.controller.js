import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;

  if (!name || !description) {
    throw new ApiError(400, "Name and Description are required!");
  }

  if (!user) {
    throw new ApiError(401, "Authentication Required - No User Found!");
  }

  let newPlaylist = await Playlist.create({
    name,
    description,
    videos: [],
    owner: user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist Created Successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  if (!userID || !isValidObjectId(userID)) {
    throw new ApiError(404, "User ID Not Found Or Invalid!");
  }

  let userDoc = await User.findById(userID);

  if (!userDoc) {
    throw new ApiError(404, "User Does Not Exist!");
  }

  let userPlaylists = await Playlist.find({ owner: userID }, "-owner", {
    sort: { createdAt: -1 },
  });

  if (userPlaylists.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No Playlists Found!"));
  }

  res.status(200).json(new ApiResponse(200, userPlaylists, "Playlists Found!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistID, videoID } = req.params;
  
    if (!playlistID || !isValidObjectId(playlistID)) {
      throw new ApiError(404, "Playlist ID Not Found Or Invalid!");
    }
  
    if (!videoID || !isValidObjectId(videoID)) {
      throw new ApiError(404, "Video ID Not Found or Invalid!");
    }
  
    const videoDoc = await Video.findById(videoID);
    if (!videoDoc) {
      throw new ApiError(404, "Video Does Not Exist!");
    }
  
    const playlistDoc = await Playlist.findById(playlistID);
    if (!playlistDoc) {
      throw new ApiError(404, "Playlist Does Not Exist!");
    }
  
    const isVideoInPlaylist = playlistDoc.videos.some(id => id.toString() === videoID);
    if (isVideoInPlaylist) {
      return res.status(200).json(new ApiResponse(200, "Video Already Included in Playlist!"));
    }
  
    playlistDoc.videos.push(videoID);
    const updatedPlaylist = await playlistDoc.save();
  
    if (!updatedPlaylist) {
      throw new ApiError(500, "Video Could Not Be Added to Playlist!");
    }
  
    res.status(200).json(new ApiResponse(200, updatedPlaylist, "New Video Added to Playlist Successfully!"));
  });

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistID, videoID } = req.params;

  if (!playlistID || !isValidObjectId(playlistID)) {
    throw new ApiError(404, "PlayList ID Not Found Or Invalid!");
  }

  if (!videoID || !isValidObjectId(videoID)) {
    throw new ApiError(404, "Video ID Not Found or Invalid!");
  }

  let videoDoc = await Video.findById(videoID);

  if(!videoDoc){
    throw new ApiError(404,"Video Does Not Exist!");
  }

  let updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistID,
    { $pull: { videos: videoID } },
    { new: true, runValidators: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      404,
      "Video Could Not Be Added to Playlist or Playlist Not Found!"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video Removed From Playlist Successfully!"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;

  if (!playlistID || !isValidObjectId(playlistID)) {
    throw new ApiError(404, "PlayList ID Not Found Or Invalid!");
  }

  const playlist = await Playlist.findById(playlistID);

  if (!playlist) {
    throw new ApiError(404, "Playlist Does Not Exist!");
  }

  res.status(200).json(new ApiResponse(200, playlist, "Playlist found."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;
  const { name, description } = req.body;
  const user = req.user;

  if (!playlistID || !isValidObjectId(playlistID)) {
    throw new ApiError(404, "PlayList ID Not Found Or Invalid!");
  }

  if (!name && !description) {
    throw new ApiError(400, "Either Name or Description must be Provided For Update!");
  }

  const update = {};
  if (name) update.name = name;
  if (description) update.description = description;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistID, update, {
    runValidators: true,
    new: true,
  });

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist Not Found or Could Not be Updated!");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "PlayList Updated Succesfully!")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;

  if (!playlistID || !isValidObjectId(playlistID)) {
    throw new ApiError(404, "PlayList ID Not Found Or Invalid!");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistID);

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist Not Found or Could Not be Deleted!");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "PlayList Deleted Succesfully!")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  removeVideoFromPlaylist,
  addVideoToPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
};
