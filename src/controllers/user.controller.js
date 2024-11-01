import { jwt } from 'jsonwebtoken';
// internal imports
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { tokens } from "../constants.js"


// methods
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// global Variable for cookies
const options = {
    httpOnly: true,
    secure: true,
}



// api controllers
const getSIngleUser = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: "ok" })
})

// register users
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    // checking is fields are empty
    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }

    // checking user exist
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log("file is consoling from 25 line: ", req?.files)
    // files checking
    const avatarLocalPath = req?.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req?.files && Array.isArray(req?.files?.coverImage) && req?.files?.coverImage?.length > 0) {
        coverImageLocalPath = req?.files?.coverImage[0]?.path
    }

    if (!avatarLocalPath) throw new ApiError(400, "avatar is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log(avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "avatar is required")

    const user = await User.create({
        fullName,
        avatar: avatar?.secure_url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username?.toLowerCase()
    })

    console.log("user:", user)

    const createdUser = await User.findById(user?._id).select("-password -refreshToken")

    if (!createdUser) throw new ApiError(500, "Something went wrong || registering error !!!")

    res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully !!!"))
})

// sign in
const signInUser = asyncHandler(async (req, res) => {

    // data from client
    const { password, username, email } = req.body
    if (!(username || email)) throw new ApiError(400, "username or email is required !!!")
    // user exist checking
    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) throw new ApiError(404, "User does not exist !!!")

    // password comparison 
    const isValidPassword = await user.isPasswordCorrect(password)
    if (!isValidPassword) throw new ApiError(401, "Invalid Credentials")

    // generate accessToken  and Refresh token
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user?._id)
    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken")


    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged in Successfully !!!"))
})

// sign out
const signOutUser = asyncHandler(async (req, res) => {
    const update = await User.findByIdAndDelete(req?.user?._id, {
        $set: {
            refreshToken: undefined
        }
    }, { new: true }
    )

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshTOken", options)
        .json(new ApiResponse(200, {}, "logout successfully !!!"))

})

// refreshAccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req?.body?.refreshToken

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request !!!")

    const { _id } = await jwt.verify(incomingRefreshToken, tokens?.RTS)

    const user = await User.findById(_id).select("-password")
    if (!user) throw new ApiError(404, "invalid refresh token !!!")

    if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used !!!")

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user?._id)

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "access token refreshed successfully !!!"))

})

export { getSIngleUser, registerUser, signInUser, signOutUser, refreshAccessToken }