import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Video } from './../models/video.model.js';
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType = "des", userId } = req.query
    const pipeline = [
        {
            $match: {
                isPublished: true,
                ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
                ...(query && {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                })
            }
        },
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
                            avatar: 1,
                        }
                    },
                    {
                        $limit: 1
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $sort: {
                [sortBy]: sortType === "des" ? -1 : 1
            }
        }
    ]




    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)
    if (!videos) throw new ApiError(404, "something went wrong !!!")

    res.status(200)
        .json(new ApiResponse(200, videos, "videos fetched successfully !!!"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title) throw new ApiError(404, "title is required !!!")

    if (!req?.user) throw new ApiError(401, "Unauthorized request !!!")
    // local path of files
    const videoLocalFile = req?.files?.videoFile
    const thumbnailLocalFile = req?.files?.thumbnail

    if (!videoLocalFile || !thumbnailLocalFile) throw new ApiError(404, "video and thumbnail are required !!!")

    const videoFile = await uploadOnCloudinary(videoLocalFile)
    console.log("videoFile 1", videoFile)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFile)
    console.log("thumbnail 1", thumbnail)

    if (!videoFile || !thumbnail) throw new ApiError(500, "something went wrong while uploading files to the server")

    const data = {
        title,
        description,
        videoFile: videoFile[0]?.url || "",
        duration: videoFile[0]?.duration || 0,
        thumbnail: thumbnail[0]?.url,
        owner: new mongoose.Types.ObjectId(req?.user?._id)
    }

    const result = await Video.create(data)

    return res.status(200).json(new ApiResponse(200, result, "published successful !!!"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        // Increment views
        await Video.updateOne(
            { _id: new mongoose.Types.ObjectId(videoId) },
            { $inc: { views: 1 } }
        );

        console.log("video id: ", videoId);

        // Aggregation pipeline to fetch video with owner details
        const video = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users", // Make sure this collection name is correct
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: { path: "$owner", preserveNullAndEmptyArrays: true }
            }
        ]);

        console.log("video pipeline: ", video);

        if (!video || video.length === 0) {
            throw new ApiError(404, "video not found");
        }

        res.status(200)
            .json(new ApiResponse(200, video, "video fetched by Id successfully !!!"))

    } catch (error) {
        console.log("error :", error)
        throw new ApiError(500, "something went wrong while fetching video by Id !!!", error)
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req?.body
    const thumbnailLocalPath = req?.file?.path

    if (!(title || description || thumbnailLocalPath)) throw new ApiError(400, "There is no field to update !!!");

    let thumbnail;
    if (thumbnailLocalPath) thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("thumbnail ", thumbnail)
    const result = await Video.findByIdAndUpdate(videoId, {
        $set: {
            ...(thumbnail && { thumbnail: thumbnail?.url }),
            ...(title && { title }),
            ...(description && { description })
        }
    }, { new: true })

    if (!result) throw new ApiError(500, "something went wrong while updating the video")

    return res.status(200).json(new ApiResponse(200, result, "updated successful !!!"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "video id not founded")

    const result = await Video.findByIdAndDelete(videoId, { lean: true, new: true })

    if (!result) throw new ApiError(404, "something went wrong !!!");
    return res.status(200).json(new ApiResponse(200, result, "video deleted successfully !!!"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "video id not founded")

    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(404, "video not found !!!");

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(new ApiResponse(200, { isPublished: video.isPublished }, "video deleted successfully !!!"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}