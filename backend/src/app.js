import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const app=express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port" , (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit : "40kb"}));
app.use(express.urlencoded({limit : "40kb" , extended: true}))

app.use("/api/v1/users" , userRoutes);

const start = async ()=>{
    const connectionDb = await mongoose.connect("mongodb+srv://sakshamg1152:saksham04@zoomcluster0.0whfteu.mongodb.net/?appName=ZoomCluster0");
    console.log("connected to DB")
    server.listen(8000 , ()=>{
        console.log("listening to the port");
    });
}


start();
