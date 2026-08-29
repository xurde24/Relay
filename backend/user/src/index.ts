import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import userRoutes from './routes/user.js'
import connectDb from "./config/db.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from 'cors'

dotenv.config();

connectDb();
connectRabbitMQ();


export const redisClient = createClient({
  url: process.env.REDIS_URL || '',
});//create the client between my web and redis

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);//connecting that client

//event listener for error in redis connection
redisClient.on("error", (err) => {
  console.error("🔴 Redis error:", err);
});

const app = express();//create a server
app.use(express.json())
app.use(cors())

app.use("/api/v1",userRoutes)

const PORT = process.env.PORT || 5000;

//test route for redis connection
app.get("/", async (req, res) => {
  try {
    await redisClient.set("msg", "working");
    const val = await redisClient.get("msg");

    res.json({ val });
  } catch (err) {
    res.status(500).json({ error: "Redis failed" });
  }
});

//server connection
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});