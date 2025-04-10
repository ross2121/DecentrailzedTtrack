import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router=Router();
const prisma=new PrismaClient();
router.post("/regular/update/sleep",async(req:any,res:any)=>{
    const {hours,userid}=req.body;
    if(!hours||!userid){
        return res.status(500).json({message:"No hours or userid found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        },include:{
            challenge:true
        }
        
    })
const now = new Date();
const offsetIST = 330; 
const todayIST = new Date(now.getTime() + offsetIST * 60 * 1000).toISOString().split('T')[0];
if (!user) {
  return res.status(500).json({ message: "No user found" });
}
const existing = await prisma.sleep.findFirst({
  where: {
    userid: user.id,
    day: todayIST,
  },
});
if (existing) {
  await prisma.sleep.update({
    where: {
      id: existing.id,
    },
    data: {
       Hours:hours    
    },
  });
} else {
  await prisma.sleep.create({
    data: {
      userid: user.id,
      Hours: hours,
      day: todayIST, 
    },
  });
}
return res.status(200).json({ message: "Successfully updated the user" });
})
export const sleeprouter=router;