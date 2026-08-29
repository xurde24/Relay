import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const connectDb= async()=>{
    const url=process.env.MONGO_URI

    if(!url) {
        throw new Error("MONGO_URI is not defined in environment variables")
    }

    try {
        await mongoose.connect(url,{
            dbName:"LinkupChatApp"
        })
        console.log("Connected to mongo db")
    } catch (error) {
        console.error("Failed to connect to database ",error)
    }
}

export default connectDb