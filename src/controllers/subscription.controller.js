import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelID } = req.params;
    const user = req.user;

    if (!channelID || !isValidObjectId(channelID)) {
        throw new ApiError(400, "Channel ID Not Found or Invalid!");
    }

    if (!user) {
        throw new ApiError(404, "User Could Not be Authenticated!");
    }

    let subscriptionDocument = await Subscription.findOne({ subscriber: user._id, channel: channelID });

    if (!subscriptionDocument) {
        let newSubscription = await Subscription.create({
            subscriber: user._id,
            channel: channelID
        });

        if (!newSubscription) {
            throw new ApiError(500, "Error in Adding Subscription!");
        }

        res.status(201).json(new ApiResponse(201,"Subscription Added Successfully!"));
    } else {
        try {
            let result = await Like.deleteOne({ likedBy: user._id, tweet: tweetID });

            if(result.deletedCount === 1) {
                res.status(200).json(new ApiResponse(201,"Subscription Removed Successfully!"));
            } else {
                throw new ApiError(501,"Subscription Was Not Deleted Successfully!");
            }
            
        } catch (err) {
            throw new ApiError(502, "Subscription Could Not be Removed!");
        }
    }
});

const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const { channelID } = req.params;

    if (!channelID || !isValidObjectId(channelID)) {
        throw new ApiError(400, "Channel ID Not Found or Invalid!");
    }

    let subscriptionDocuments = await Subscription.find({ channel: channelID });

    if (subscriptionDocuments.length === 0) {
        res.status(201).json(new ApiResponse(200,"No Subscribers Found!"));
    }

    res.status(200).json(new ApiResponse(200, subscriptionDocuments, "Accounts Subscribed to User Channel Found!"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberID } = req.params;

    if (!subscriberID || !isValidObjectId(subscriberID)) {
        throw new ApiError(400, "Subscriber ID Not Found or Invalid!");
    }
    
    let subscriptionDocuments = await Subscription.find({ subscriber: subscriberID });

    if (subscriptionDocuments.length === 0) {
        res.status(201).json(new ApiResponse(200,"No Channels Subscribed Yet!"));
    }

    res.status(200).json(new ApiResponse(200, subscriptionDocuments, "Subscribed Channels Found!"));
});


export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}