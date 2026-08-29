import express from "express";
import dotenv from "dotenv"
import { startSendOtpConsumer } from "./consumer.js";
const app=express();


dotenv.config();
startSendOtpConsumer()
const PORT=process.env.PORT || 5001;


app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
});