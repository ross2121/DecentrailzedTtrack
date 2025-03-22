import express from "express";
import { userrouter } from "./Auth/auth";
import cors from "cors"
import { challenges } from "./Challenge/tournament";
import { Friend } from "./Auth/friend";
import { PrismaClient } from "@prisma/client";

import cron from "node-cron"
import axios from "axios";
const prisma=new PrismaClient();
const app=express();
app.use(express.json());
app.use(cors());

app.use("/api/v1",userrouter);
app.get("/test",async(req:any,res:any)=>{
    const trydd=await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    console.log(trydd.data);
    return res.json({sol:trydd.data.solana.usd});
})
app.use("/api/v1",challenges);
app.use("/api/v1",Friend);
cron.schedule('1,2,4,5 * * * *', () => {
    console.log('running every minute 1, 2, 4 and 5');
  });
  
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})
async function Gettime(){
   const enddate=await prisma.challenge.findMany({})  
   const arrayof=enddate.map((en)=>en.enddate);
   for(const arry of arrayof){

   }
}