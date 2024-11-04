import { Router } from "express";
import {
    getSIngleUser,
    registerUser,
    signInUser,
    signOutUser,
    getUserChannelProfile,
    refreshAccessToken,
    changePassword,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getWatchHistory,
    getCurrentUser
} from "../../controllers/user.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router()
// import internals 

router.route("/get-user").get(getSIngleUser)
router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
router.route("/login").post(signInUser)
router.route("/logout").post(verifyJWT, signOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router