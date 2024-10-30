import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ORIGIN } from "./constants.js";

const app = express()

app.use(cors({
    origin: ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true
}))

app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
app.use(express.static("public"))
app.use(cookieParser())


// Routes Wrapper / Handler
import routes from "./routes/routes.js"
app.use("/api/v1", routes)


export { app }