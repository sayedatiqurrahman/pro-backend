import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name) throw new ApiError(400, "name is required !!!")
    const playlist = await Playlist.create({
        name, description, owner: req?.user?._id
    })
    if (!playlist) throw new ApiError(500, "something went wrong while creating the playlist");
    return res.status(200).json(new ApiResponse(200, playlist, "playlist created successfully !!!"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const playlists = await Playlist.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
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
        { $unwind: "$owner" }
    ])

    return res.status(200).json(new ApiResponse(200, playlists, "all playlists  fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const playlist = await Playlist.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
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
        { $unwind: "$owner" }
    ]);

    return res.status(200).json(new ApiResponse(200, playlist, "playlist  fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId) throw new ApiError(400, "Playlist Id is required !!!");
    if (!videoId) throw new ApiError(400, "video Id is required !!!");

    console.log("videoId: ", videoId)
    console.log("playlistId: ", playlistId)
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "There is no video ")

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $addToSet: {
            videos: videoId
        }
    }, { new: true });
    console.log("playlist: ", playlist)
    return res.status(200).json(new ApiResponse(200, playlist, "video inserted into playlist  successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId) throw new ApiError(400, "Playlist Id is required !!!");
    if (!videoId) throw new ApiError(400, "video Id is required !!!");

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: videoId
        }
    }, { new: true })
    return res.status(200).json(new ApiResponse(200, playlist, "video inserted into playlist  successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) throw new ApiError(500, "something went wrong while deleting playlist")
    return res.status(200).json(new ApiResponse(200, playlist, "playlist deleted successfully !!!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!(name || description)) throw new ApiError(400, "There is no field to update");

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            ...(name && { name }),
            ...(description && { description })
        }
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully !!!"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}