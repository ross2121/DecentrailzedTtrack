import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router=Router();
const prisma=new PrismaClient();
router.post("/add/friend",async(req:any,res:any)=>{
   const {username,userid}=req.body;
   if(!username||!userid){
   return  res.status(400).json({message:"No username or userid found"});
   }
   const requestuser=await prisma.user.findUnique({
    where:{
        id:userid
    }
   })
   if(!requestuser){
    return res.status(500).json({message:"No user found for this particular id"})
   }
   const user=await prisma.user.findUnique({
      where:{
        username
      }
   }) 
   if(!user){
    return res.json({message:"No user found"});
   }
   prisma.$transaction(async(prisma:any)=>{
    await prisma.user.update({
        where:{
            username:username
        },data:{
            Request:{
                push:requestuser?.username
            }
        }
    })
    await prisma.user.update({
        where:{
            id:userid
        },data:{
            RequestFriend:{
                push:user?.username
            }
        }
    })
    return res.status(200).json({message:"Requested send to you friend"});
   })  
//    return res.status(500).json({message:"Failed"});
})
router.get("/friend/request/:id",async(req:any,res:any)=>{
    const id=req.params.id;
    if(!id){
        return res.json({message:"No id found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id
        }
    })
    if(!user){
        return res.json({message:"No user found"});
    }
  return res.json({message:user.Request});
})
router.get("/alredy/frien/:userdid",async(req:any,res:any)=>{
    const userid=req.params.userdid;
    if(!userid){
        return res.status(500).json({message:"No user found for this id"})
    }
    const users=await prisma.user.findUnique({
        where:{
         id:userid
        }
    })
    return res.status(200).json({username:users?.RequestFriend})
})
router.get("/get/friends/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    if(!userid){
        return res.json({message:"No user id found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        }
    })
    return res.json({user:user?.Friends});
})

router.post("/test/step",async(req:any,res:any)=>{
    const {step}=req.body;
    const daten=new Date().toISOString();
    console.log("checke");
    await prisma.steps.create({
        data:{
            userid:"9e699d39-09f1-47b8-96e8-6004a3c8eb1e",
            steps:step,
            day:daten
        }
    }) 
   return res.json({message:"send succesfully"});
})
router.post("/step/analysis", async (req: any, res: any) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const userTimezone = req.body.timezone || 'UTC';

        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6);
        const formatDateToStorageFormat = (date: Date) => {
            return date.toISOString().split('T')[0]; 
            
        };
        const stepData = await prisma.steps.findMany({
            where: {
                userid: id,
                day: {
                    gte: formatDateToStorageFormat(lastWeek),
                    lte: formatDateToStorageFormat(today)
                }
            },
            orderBy: {
                day: 'asc'
            }
        });
        const stepsMap = new Map();
        stepData.forEach(entry => {
            const dateKey = typeof entry.day === 'string' ? 
                entry.day.split('T')[0] : 
                new Date(entry.day).toISOString().split('T')[0];
            stepsMap.set(dateKey, entry.steps);
        });

        // Generate complete 7-day response
        const completeStepData = [];
        const currentDate = new Date(lastWeek);
        
        while (currentDate <= today) {
            const dateStr = formatDateToStorageFormat(currentDate);
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            
            completeStepData.push({
                date: dateStr,
                day: dayNames[currentDate.getDay()],
                steps: stepsMap.get(dateStr) || 0, // Default to 0 if no entry
                // Include other relevant fields from your schema
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json({
            message: "Step analysis completed successfully",
            analysisPeriod: {
                start: formatDateToStorageFormat(lastWeek),
                end: formatDateToStorageFormat(today),
                days: completeStepData.length
            },
            data: completeStepData
        });

    } catch (error:any) {
        console.error("Step analysis error:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.post("/accept/friend",async(req:any,res:any)=>{
    const  {userid,username,bool}=req.body;
    if(!userid||!username){
       return  res.status(400).json({message:"No userid found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid,
        }
    })
    if(!user){
        return res.status(440).json({message:"No user found for that particular id"});
    }
    const friend=user?.Request.map((frin)=>frin==username);
    if(!friend){
        return res.status(400).json({message:"No user found for that paricular id"});
    }
    if(bool){
        const users=await prisma.user.update({
            where:{
                id:userid,
            },data:{
                Friends:{
                    push:username
                },
                Request:{
                    set:user.Request.filter(el=>el!==username)
                }
            }
        })
        await prisma.user.update({
            where:{
               username:username
            },data:{
                Friends:{
                    push:username
                },
               RequestFriend:{
                set:user.RequestFriend.filter(el=>el!==users.username)
               }
            }
        })
        return res.status(200).json({message:"Friend is added your list"})
    }else{
        await prisma.user.update({
            where:{
                id:userid,
            },data:{
                Request:{
                    set:user.Request.filter(el=>el!==username)
                }
            }
        })
        return res.status(200).json({message:"User removed from you list"});
    }
})

export const Friend=router;