import mongoose from "mongoose";
import { DB_Name, mongodb } from "../constants.js";


export const connectDB = async () => {
    try {
        console.log("🚀 ~ connectDB ~ `${mongodb}/${DB_Name}`:", `${mongodb}/${DB_Name}`)
        const mongooseInstance = await mongoose.connect(`${mongodb}/${DB_Name}`)
        console.log("🚀 ~ MONGODB CONNECTION SUCCESSFUL ~ mongooseInstance:", mongooseInstance?.connections?.host)
    } catch (error) {
        console.log("🚀 ~ MONGODB CONNECTION ERROR connectDB ~ error:", error)
        process.exit(1)
    }
}