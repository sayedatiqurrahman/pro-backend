import mongoose from "mongoose"
import { Video } from "../models/video.model.js"

import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Subscription } from './../models/subscription.models.js';
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // total video views, total subscribers, total videos, total likes etc.

    const _id = new mongoose.Types.ObjectId(req?.user?._id)
    const stats = await User.aggregate([
        { $match: { _id } },
        {
            $addFields: {
                ownerInfo: {
                    fullName: "$fullName",
                    username: "$username",
                    avatar: "$avatar"
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                let: { ownerDetails: "$ownerInfo" },  // Pass ownerInfo as a variable
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes",
                        }
                    },
                    {
                        $addFields: {
                            owner: "$$ownerDetails"  // Use the passed variable
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },

        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" },
                totalSubscribers: { $size: "$subscribers" },
                totalLikes: { $size: "$videos.likes" }
            }
        }, {
            $project: {
                // ownerInfo: 0,
                // refreshToken: 0,
                // password: 0,
                // subscribers: 0,
                // videos: 0
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ])
    console.log(stats)

    return res.status(200).json(new ApiResponse(200, stats, "dashboard stats data fetched !!!"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const _id = new mongoose.Types.ObjectId(req?.user?._id)
    const stats = await User.aggregate([
        { $match: { _id } },
        {
            $addFields: {
                ownerInfo: {
                    fullName: "$fullName",
                    username: "$username",
                    avatar: "$avatar"
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                let: { ownerDetails: "$ownerInfo" },
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $addFields: {
                            owner: "$$ownerDetails"
                        }
                    }
                ]
            }
        }, {
            $project: {
                // ownerInfo: 0,
                videos: 1
            }
        }

    ])


    return res.status(200).json(new ApiResponse(200, stats, "All videos fetched - uploaded by this channel !!!"))
})

export {
    getChannelStats,
    getChannelVideos
}