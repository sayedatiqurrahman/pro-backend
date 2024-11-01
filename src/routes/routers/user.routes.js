import { Router } from "express";
import { getSIngleUser, refreshAccessToken, registerUser, signInUser, signOutUser } from "../../controllers/user.controller.js";
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

export default router