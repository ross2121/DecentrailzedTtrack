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
async function Gettime() {
    const enddatespublic = await prisma.challenge.findMany({
    
    });    
    const arrayof = enddatespublic.map(en => en.enddate);
    for (const enddate of arrayof) {
        const date = new Date(enddate);
        date.setDate(date.getDate()+1);
        const day = date.getDate();
        const month = date.getMonth() + 1; 
        const year = date.getFullYear();
        const cronSchedule = `0 0 ${day} ${month} *`;
      cron.schedule(cronSchedule,async () => {
            console.log(`Running cron job for end date: ${enddate}`);
             enddatespublic.map(async(member)=>{
                 const publicmember=member.members;
                 publicmember.map(async(user)=>{
                    const userd=await prisma.user.findUnique({
                        where:{
                            id:user
                        },include:{
                            step:true
                        }
                    })    
                    const startdate=new Date(member.startdate);
                    const enddate=new Date(member.enddate);
                     let usercheck=true;  
                    for (let currentDate = startdate; currentDate <= enddate; currentDate.setDate(currentDate.getDate() + 1)) {
                        if(userd==null){
                            return;
                        }
                        const stepForCurrentDay = userd.step.find(step => {
                            const stepDate = new Date(step.day);
                            return (
                                stepDate.getFullYear() === currentDate.getFullYear() &&
                                stepDate.getMonth() === currentDate.getMonth() &&
                                stepDate.getDate() === currentDate.getDate()
                            );
                        }) 
                        if(stepForCurrentDay){
                            if(parseInt(stepForCurrentDay.steps)>member.Dailystep){
                                  usercheck=false;   
                                  break;       
                            }
                        }
                    }
                   if(usercheck){
                     await prisma.challenge.update({
                        where:{
                            id:member.id
                        },data:{
                            Payoutpeople:{
                                push:userd?.id
                            }
                        }
                     })
                   } 
                   usercheck=true;
                 }) 
                 try{ 
                    await axios.post("https://decentrailzed-ttrack.vercel.app/challenge/finish",{id:member.id})   } 
                    catch(e){
                      console.log(e);
                    }
             })
         
        });
        console.log("check");
    }
}
Gettime();    
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})
