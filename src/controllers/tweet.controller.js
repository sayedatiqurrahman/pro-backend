import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const owner = req?.user?._id;
    console.log("content", content)
    console.log("owner", owner)
    if (!content) throw new ApiError(400, "There is no content");
    if (!owner) throw new ApiError(401, "Unauthorized request !!!");

    const result = await Tweet.create({ content, owner })

    return res.status(200).json(new ApiResponse(200, result, "tweet inserted successfully !!!"))
})

const getAllTweets = asyncHandler(async (_, res) => {
    // TODO: get user tweets
    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{
                    $project: {
                        fullName: 1,
                        username: 1,
                        avatar: 1,
                    }
                }]
            }
        },
        {
            $unwind: { path: "$owner", preserveNullAndEmptyArrays: true }
        }
    ])

    if (tweets?.length === 0) throw new ApiError(404, "there is no tweet");
    return res.status(200).json(new ApiResponse(200, tweets, "fetched tweets successfully !!!"))
})
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) throw new ApiError(400, "user id is missing !!!");

    const tweets = await Tweet.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: { owner: { $first: "$owner" } }
        }
    ])

    if (tweets?.length === 0) throw new ApiError(404, "There is no tweet of this user")

    return res.status(200).json(new ApiResponse(200, tweets, "All tweets are fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req?.params
    const { content } = req?.body
    if (!tweetId) throw new ApiError(400, "Tweet ID is missing");

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: { content }
    }, { new: true })

    return res.status(200).json(new ApiResponse(200, tweet, "updated tweet successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req?.params
    if (!tweetId) throw new ApiError(400, "Tweet Id is missing");

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(new ApiResponse(200, tweet, "tweet deleted successfully"))
})

export {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
}