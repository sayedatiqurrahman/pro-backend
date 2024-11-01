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
            .upload(localFilePath, {
                resource_type: "auto",
                unique_filename: true,
                use_filename: true,
                overwrite: false
            })
        console.log("file uploaded on cloudinary", res?.url)
        fs.unlinkSync(localFilePath)
        return res
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}


export { uploadOnCloudinary }