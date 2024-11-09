import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "video id is missing !!!");
    const data = { video: videoId, likedBy: req?.user?._id }

    const deletedLike = await Like.findOneAndDelete(data)
    if (deletedLike) return res.status(200).json(new ApiResponse(200, deletedLike, "disliked successfully !!!"));

    const liked = await Like.create(data);
    return res.status(200).json(new ApiResponse(200, liked, "liked successfully !!!"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) throw new ApiError(400, "comment id is missing !!!");
    const data = { comment: commentId, likedBy: req?.user?._id }

    const deletedLike = await Like.findOneAndDelete(data)
    if (deletedLike) return res.status(200).json(new ApiResponse(200, deletedLike, "disliked successfully !!!"));

    const liked = await Like.create(data);
    return res.status(200).json(new ApiResponse(200, liked, "liked successfully !!!"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) throw new ApiError(400, "tweet id is missing !!!");
    const data = { tweet: tweetId, likedBy: req?.user?._id }

    const deletedLike = await Like.findOneAndDelete(data)
    if (deletedLike) return res.status(200).json(new ApiResponse(200, deletedLike, "disliked successfully !!!"));

    const liked = await Like.create(data);
    return res.status(200).json(new ApiResponse(200, liked, "liked successfully !!!"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const _id = new mongoose.Types.ObjectId(req?.user?._id)
    const likedVideos = await Like.aggregate([
        { $match: { _id } },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedBy",
                pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }]
            }
        }, {
            $unwind: { path: "$likedBy", preserveNullAndEmptyArrays: true }
        }, {
            $lookup: {
                from: "videos",
                localField: "Video",
                foreignField: "_id",
                as: "videos"
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, likedVideos, "liked videos fetched successfully !!!"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}