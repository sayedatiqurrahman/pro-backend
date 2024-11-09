import { v2 as cloudinary } from 'cloudinary';
import { cloudinary_variables } from '../constants.js';
import fs from "fs"

cloudinary.config({
    cloud_name: cloudinary_variables?.cloud_name,
    api_key: cloudinary_variables?.api_key,
    api_secret: cloudinary_variables?.api_secret
});


// Function to upload to Cloudinary and delete local files
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (Array.isArray(localFilePath)) {
            const results = [];
            for (const file of localFilePath) {
                // Ensure each file is a path string
                const path = typeof file === 'object' && file.path ? file.path : file;

                // Log for debugging
                console.log("Uploading and deleting file path 2:", path);

                // Upload and delete file only if path is valid
                if (typeof path === "string") {
                    const res = await cloudinary.uploader.upload(path, {
                        resource_type: "auto",
                        unique_filename: true,
                        use_filename: true,
                        overwrite: false
                    });
                    results.push(res);
                    console.log("res 2:", res)
                    fs.unlinkSync(path); // Delete each file after uploading
                } else {
                    console.warn("Skipping deletion of invalid path:", path);
                }
            }
            return results;
        } else if (typeof localFilePath === "string") {
            // Handle single file path
            console.log("Uploading and deleting single file path 3:", localFilePath);
            const res = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                unique_filename: true,
                use_filename: true,
                overwrite: false
            });
            fs.unlinkSync(localFilePath); // Delete the file after uploading
            console.log("res 3:", res)
            return res;
        } else {

            console.log("Uploading and deleting single file path 4:", localFilePath);
            const res = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                unique_filename: true,
                use_filename: true,
                overwrite: false
            });
            console.log("res 4:", res)
            fs.unlinkSync(localFilePath); // Delete the file after uploading
            return res;
        }
    } catch (error) {
        console.error("Error in uploadOnCloudinary:", error);
        throw error;
    }
};



export { uploadOnCloudinary }