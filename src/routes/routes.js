import { Router } from "express";
const router = Router()

// Import all routes
import dashboardRoutes from "./routers/dashboard.routes.js"
import userRoutes from "./routers/user.routes.js"
import videoRoutes from "./routers/video.routes.js"
import tweetRoutes from "./routers/tweet.routes.js"
import subscriptionRoutes from "./routers/subscription.routes.js"
import playlistRoutes from "./routers/playlist.routes.js"
import likeRoutes from "./routers/like.routes.js"
import commentRoutes from "./routers/comment.routes.js"
import healthCheckRoutes from "./routers/healthCheck.routes.js"

router.use("/user", userRoutes)
router.use("/video", videoRoutes)
router.use("/tweet", tweetRoutes)
router.use("/subscription", subscriptionRoutes)
router.use("/playlist", playlistRoutes)
router.use("/like", likeRoutes)
router.use("/dashboard", dashboardRoutes)//
router.use("/comment", commentRoutes)
router.use("/server-health", healthCheckRoutes)

export default router