import express from "express";
import { userrouter } from "./Auth/auth";
import cors from "cors"
import { challenges } from "./Challenge/tournament";
import { Friend } from "./Auth/friend";
const app=express();
app.use(express.json());
app.use(cors());
app.use("/api/v1",userrouter);
app.use("/api/v1",challenges);
app.use("/api/v1",Friend);
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})