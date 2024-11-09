import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const pipeline = [
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
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
                        avatar: 1
                    }
                }]
            }
        },
        {
            $unwind: { path: "$owner", preserveNullAndEmptyArrays: true }
        }
    ]

    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), { page, limit })

    return res.status(200).json(new ApiResponse(200, comments, "comments fetched successfully !!!"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req?.body
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req?.user?._id
    })

    if (!comment) throw new ApiError(500, "something went wrong while comment creation !!!");

    return res.status(200).json(new ApiResponse(200, comment, "comment posted successfully !!!"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req?.params;
    const { content } = req?.body;
    const result = await Comment.findByIdAndUpdate(commentId, { $set: { content } }, { new: true })
    if (!result) throw new ApiError(500, "something went wrong while updating the comment !!!");

    return res.status(200).json(new ApiResponse(200, result, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req?.params;
    const result = await Comment.findByIdAndDelete(commentId)

    if (!result) throw new ApiError(500, "something went wrong while deleting the comment !!!");

    return res.status(200).json(new ApiResponse(200, result, "comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}