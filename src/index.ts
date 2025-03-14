import express from "express";
import { userrouter } from "./Auth/auth";
import cors from "cors"
const app=express();
app.use(express.json());
app.use(cors());
app.use("/api/v1",userrouter);
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})