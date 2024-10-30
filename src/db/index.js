import mongoose from "mongoose";
import { DB_Name, mongodb_uri } from "../constants.js";


export const connectDB = async () => {
    try {
        const mongooseInstance = await mongoose.connect(`${mongodb_uri}/${DB_Name}`)
        console.log("🚀 ~ MONGODB CONNECTION SUCCESSFUL ~ mongooseInstance:", mongooseInstance?.connections[0]?.host)
    } catch (error) {
        console.log("🚀 ~ MONGODB CONNECTION ERROR connectDB ~ error:", error)
        process.exit(1)
    }
}