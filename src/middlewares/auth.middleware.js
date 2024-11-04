
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { tokens } from "../constants.js"
import { User } from "../models/user.model.js"


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) throw new ApiError(401, "Unauthorized request");

        const decoded = jwt.verify(token, tokens?.ATS)

        const user = await User.findById(decoded?._id).select("-password -refreshToken")
        if (!user) throw new ApiError(401, "Invalid  Access Token")

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while checking token !!!")
    }
})