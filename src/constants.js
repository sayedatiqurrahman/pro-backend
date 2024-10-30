// GENERAL CONSTANTS
const DB_Name = "pro_backend"



// Env Constants
const ps = process.env
const mongodb_uri = ps.MONGO_DB
const ORIGIN = ps.CORS_ORIGIN

const tokens = {
    ATS: ps.ACCESS_TOKEN_SECRET,
    ATE: ps.ACCESS_TOKEN_EXPIRY,
    RTS: ps.REFRESH_TOKEN_SECRET,
    RTE: ps.REFRESH_TOKEN_EXPIRY
}

// cloudinary_variables
const cloudinary_variables = {
    cloud_name: ps.CLOUD_NAME,
    api_key: ps.API_KEY,
    api_secret: ps.API_SECRET
}

// Exports All
export { DB_Name, mongodb_uri, ORIGIN, tokens, cloudinary_variables }