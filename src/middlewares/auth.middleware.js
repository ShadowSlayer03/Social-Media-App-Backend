import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJWToken = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
    
        if(!token){
            throw new ApiError(401,"Unauthorized access");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401,"Invalid access token!");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,"Something went wrong in verification of token!");
    }
});

export  {verifyJWToken};