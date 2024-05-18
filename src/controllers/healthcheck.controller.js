import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getHealth = asyncHandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,"API Working Fine!"));
});

export default getHealth;