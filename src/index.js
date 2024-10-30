import dotenv from 'dotenv';
import mongoose from "mongoose";
import express from 'express';
import { connectDB } from './db/index.js';
import { app } from './app.js';

dotenv.config({ path: './.env' });

const port = process.env.PORT || 3000


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`🌞 Server is running on PORT : ${port}`)
    })
}).catch((err) => {
    console.log("MONGODB connection error !!!", err)
})

