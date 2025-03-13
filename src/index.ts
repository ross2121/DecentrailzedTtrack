import express from "express";
import { userrouter } from "./Auth/auth";
const app=express();
app.use(express.json());
app.use("/api/v1",userrouter);
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})