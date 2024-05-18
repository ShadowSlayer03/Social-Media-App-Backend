import dotenv from "dotenv";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from '../models/user.models.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
dotenv.config();

const generateAccessandRefreshTokens = async(userID)=>{
    try {
        const user = await User.findById(userID);
        const newRefreshToken = user.generateRefreshToken();
        const newAccessToken = user.generateAccessToken();

        user.refreshToken = newRefreshToken;
        await user.save({validateBeforeSave: false});

        return {newRefreshToken,newAccessToken};

    } catch (error) {
        throw new ApiError(500,"Server error! Tokens could not be created!")
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    // STEPS
    // 1. Taking details from user on frontend.
    // 2. Validating those details 
    // 3. Check if user already exists in DB: username,email,password etc
    // 4. Check for avatar
    // 5. Upload the avatar to cloudinary 
    // 6. Create user object - create entry in DB
    // 7. Select all the fields of that user returned from db except password and refreshToken
    // 8. Check for user creation
    // 9. Return res

    //1.
    const {username, fullname, email,password} = req.body;
    console.log(username, fullname, email);

    // 2.
    if (fullname === "" || username == "" ||  email == "") {
        throw new ApiError(400,"All Fields Are Required!");
    }

    // 3.
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existedUser)
    {
        throw new ApiError(409,"User With Username or Email Already Exists!");
    }

    // 4.
    console.log("Multer files:",req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImgLocalPath = req.files?.coverImage[0].path;

    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImgLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) 
    throw new ApiError(400,"Avatar or Cover image not present!");

    // 5.
    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    const coverImgUpload = await uploadOnCloudinary(coverImgLocalPath);

    if (!avatarUpload) {
        throw new ApiError(400,"Avatar file not uploaded on cloudinary!");
    }

    // 6.
    const newUser=User.create({
        fullname,
        avatar: avatarUpload.url,
        coverImage: coverImgUpload?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // 7.
    const createdUser = User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    // 8.    
    if(!createdUser)
    throw new ApiError(500,"Server Error: Created user was not retrieved successfully");

    // 9.    
    res.sendStatus(201).json(new ApiResponse(200,createdUser,"All processes done successfully!"));

});

const loginUser = asyncHandler(async(req,res)=>{
    // STEPS
    // 1. Extract info from req.body particularly username/email and password.
    // 2. Ensure that username, email and password fields are present otherwise throw error.
    // 3. Get the user from the database
    // 4. Check if the password is correct
    // 5. Give access and refresh token to the user
    // 6. Send cookie 

    // 1.
    const {email,username,password } = req.body;

    // 2.
    if(!(username || email)){
        throw new ApiError(400,"Username or Email is required")
    }

    // 3.
    let user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user){
        throw new ApiError(404, "User does not exist!");
    }

    // 4.
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid user credentials!");
    }

    let {newRefreshToken,newAccessToken} = await generateAccessandRefreshTokens(user?._id);

    let options = {
        httpOnly: true,  // This makes sure that the cookies stored on client side can only be modifed by the server.
        secure: true     // This makes sure that cookies are sent back to server only via HTTPS
    } 

    let loggedInUser = await User.findById(user._id);

    res.cookie('accessToken',newAccessToken, options);
    res.cookie('refreshToken',newRefreshToken, options);

    res.status(200).json(new ApiResponse(200,{user: loggedInUser,newAccessToken,newRefreshToken},"Logged In successfully!"));
});

const logoutUser = asyncHandler(async(req, res) => {
    // STEPS
    // 1. Extract the user's ID from the request (assuming it's stored in req.user)
    // 2. Find the user in the database
    // 3. Clear the refresh token and access token from the user document
    // 4. Save the updated user document
    // 5. Clear the cookies containing the tokens from the response

    const userID = req.user._id;
    if (!userID) {
        console.log("No userID found in req.user");
    }

    const user = await User.findById(userID);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.refreshToken = null;
    user.accessToken = null;
    await user.save({ validateBeforeSave: false });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json(new ApiResponse(200, null, "User logged out successfully!"));
});

const renewAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        console.log(incomingRefreshToken);

        let decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decoded token",decodedToken);

        let user = await User.findById(decodedToken?._id);
        console.log("user",user);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized access");
        }

        const options =
            { 
                httpOnly: true, secure: true 
            }

        const {newRefreshToken, newAccessToken} = await generateAccessandRefreshTokens(user?._id);

        return res
        .status(200)
        .cookie("accessToken", newAccessToken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(new ApiResponse(200, {newAccessToken, newRefreshToken},"Access Token refreshed!"));

    } catch (error) {
        // Handle errors
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Refresh token expired");
        } else {
            throw new ApiError(401, "Invalid refresh token");
        }
    }
});

const changePassword = asyncHandler(async(req,res)=>{
    const {newPassword, oldPassword} = req.body;

    if(newPassword.length==0)
    throw new ApiError(400,"New Password Field cannot be Empty!")

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404,"User not Found!");
    }

    let isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Old Password!");
    }

    if(newPassword===oldPassword)
    throw new ApiError(400,"New Password Cannot be Same as Old One!")

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully!"));
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current User fetched succesfully!"));
});

// Try to keep file update controllers separate from data update
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {email,fullName} = req.body;

    if(!(email && fullName)){
        throw new ApiError(400, "All fields are required!");
    }

    // AAM ZINDAGI
    // let user = await User.findById(req.user?._id);
    // if(!user){
    //     throw new ApiError(400,"User Not Found!");
    // }
    // user.email = email;
    // user.fullName = fullName;
    // await user.save({validateBeforeSave: false});

    // MENTOS ZINDAGI
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password");

    if(!user){
        throw new ApiError(400,"User Not Found!");
    }

    res.status(200).json(new ApiResponse(201,{},"Updated Account Details successfully!"));
});

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Local Path Not Found!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on cloudinary");
    }

    let user = await User.findById(req.user?._id).select("-password");
    let oldAvatarCloudinaryURL = user.avatar;
    console.log(oldAvatarCloudinaryURL);

    await deleteFromCloudinary(oldAvatarCloudinaryURL);
    user.avatar = avatar.url;
    await user.save();
    
    res.status(200).json(new ApiResponse(201, user,"Updated Avatar successfully!"));
    
});

const updateUserCoverImg = asyncHandler(async(req,res)=>{
    let coverImgLocalPath = req.file?.path;

    if(!coverImgLocalPath){
        throw new ApiError(400,"Cover Img Local Path Not Found!");
    }

    let uploadCoverImg = await uploadOnCloudinary(coverImgLocalPath);


    if(!uploadCoverImg){
        throw new ApiError(400,"Cover Img Not Uploaded!");
    }

    let user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: uploadCoverImg?.secure_url
            }
        },
        { new: true}
    ).select("-password");

    res.status(200).json(new ApiResponse(201, user,"Updated Cover Image successfully!"));
});

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(404,"Username is missing!");
    }

    const channel = await User.aggregate([
        {
            $match:{
            username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage:1,
                email: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                createdAt: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "No such channel exists")
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"Channel fetched successfully!"));
});

const getWatchHistory = asyncHandler(async(req,res)=>{
    // Interview Question: When u access _id in MongoDB, what do you get? 
    // Actually in MongoDB id is stored as ObjectId(unique_string). But we can pass only the string directly in Users.findById 
    // because Mongoose automatically converts it into MongoDB ObjectId and performs the search.

    const user = await User.aggregate([
        {
            // We need to match like this because inside aggregation there isn't any inbuilt function to convert unique string to MongoDB id.
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        // Here we need to nest lookups because from first lookup, we find all the documents in videos corresponding to videos that user liked.
        // Now for each video, we need to get the owner of the video which is also a user so second lookup.
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: 
                            [
                            {
                                $project:{
                                    username: 1,
                                    fullName: 1,
                                    avatar: 1
                                }
                            },
                            {
                                $addFields:{
                                    owner:{
                                        $first: "owner"
                                    }
                                }
                            }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,user[0],"Watch History fetched successfully!"));
});

export {
    registerUser, 
    loginUser,
    logoutUser, 
    renewAccessToken, 
    changePassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory
}