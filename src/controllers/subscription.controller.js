import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Subscription } from './../models/subscription.models.js';



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId: channel } = req.params
    const subscriber = req?.user?._id
    let result;
    let message;
    const exist = await Subscription.findOne({ channel, subscriber })
    if (exist) {
        result = await Subscription.findOneAndDelete({ channel, subscriber })
        message = "unsubscribed successfully !!!"
    } else {
        result = await Subscription.create({ subscriber, channel })
        message = "subscribed successfully !!!"
    }

    if (!result) throw new ApiError(500, "something went wrong !!! . while subscription is processing")

    return res.status(200).json(new ApiResponse(200, result, message))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const pipeline = [
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
            $addFields: {
                subscriber: { $first: "$subscriber" },
                isSubscriber: true
            }
        }
    ]
    const subscribers = await Subscription.aggregate(pipeline)

    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers fetched successfully !!!"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
            $unwind: "$channel" // Convert the channel array to an object
        },
        {
            $project: {
                _id: 0,             // Optionally hide the subscription ID
                channel: "$channel", // Keep the channel details as an object
                isSubscriber: { $literal: true } // Add a field to indicate subscription status
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully!"));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}