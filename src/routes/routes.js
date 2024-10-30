import { Router } from "express";
const router = Router()

// Import all routes
import userRoutes from "./routers/user.routes.js"

router.use("/user", userRoutes)

export default router