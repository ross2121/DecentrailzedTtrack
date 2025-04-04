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
app.use("/api/v1",challenges);
app.use("/api/v1",Friend);
app.get("/test",async(req:any,res:any)=>{
    const trydd=await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    console.log(trydd.data);
    return res.json({sol:trydd.data.solana.usd});
})
app.get("/tes",async(req:any,res:any)=>{
    return res.json({message:"youval"});
})
async function Gettime() {
    console.log("checekdsds");
    const cronSchedule = `0 0 * * *`; 
    cron.schedule(cronSchedule, async () => {
        const enddatespublic = await prisma.challenge.findMany({});
          console.log("chek1");
            for (const member of enddatespublic) {  
                console.log(member.PayoutStatus)
                console.log(member);
                if(member.PayoutStatus=="payoutsucess"||member.PayoutStatus=="completed"){
                    console.log("checke1");
                    continue;
                } 
                const date = new Date(member.enddate);
              date.setDate(date.getDate());
                date.setHours(0, 0, 0, 0);
                if (member.status === "CurrentlyRunning" && new Date(member.enddate) < date) {
                    await prisma.challenge.update({
                        where: {
                            id: member.id,
                        },
                        data: {
                            status: "Completed",
                        },
                    });
                }
                try{
                    if (member.status === "Completed") {
                    if (member.PayoutStatus === "pending") {
                        const publicmember = member.members;
                        for (const user of publicmember) {
                                const response = await axios.post("http://localhost:3000/api/v1/step/verification", {
                                    startdate: member.startdate,
                                    enddate: member.enddate,
                                    userid: user,
                                    challengeid: member.id,
                                });
                                console.log(response.data);
    
                        }
                            const response = await axios.post("http://localhost:3000/api/v1/challenge/finish", { id: member.id });
                            console.log(response.data);
                            const payoutmap = await prisma.payoutPerson.findMany({
                                where: {
                                    challengeId: member.id,
                                },
                            });
                            const remainig = await prisma.remainingPerson.findMany({
                                where: {
                                    challengeId: member.id,
                                },
                            });
                            if (payoutmap.length === 0 && remainig.length === 0) {
                                await prisma.challenge.update({
                                    where: {
                                        id: member.id,
                                    },
                                    data: {
                                        PayoutStatus: "completed",
                                    },
                                });
            
                            } else {
                                await prisma.challenge.update({
                                    where: {
                                        id: member.id,
                                    },
                                    data: {
                                        PayoutStatus: "payoutsucess",
                                    },
                                });
                            
                            }
                        //    break;
                    }
                }
            }
            catch(e){
                console.log(e);
            }
            }
    });
}

Gettime();    
const port=3000;
app.listen(port,()=>{
    console.log(`Server is listening at ${port}`);
})

