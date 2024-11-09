import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


export const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is healthy!",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
})

