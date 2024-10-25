import { v2 as cloudinary } from 'cloudinary';
import { cloudinary_variables } from '../constants.js';
import fs from "fs"

cloudinary.config({
    cloud_name: cloudinary_variables?.cloud_name,
    api_key: cloudinary_variables?.api_key,
    api_secret: cloudinary_variables?.api_secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const res = await cloudinary.uploader
            .upload(localFilePath, { resource_type: "auto" })
        console.log("file uploaded on cloudinary", res?.url)
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}


export { uploadOnCloudinary }