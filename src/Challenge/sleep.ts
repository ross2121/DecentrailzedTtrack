import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { sleepchallenge } from "../Auth/type";
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
router.post("/create/challenge/sleep",async(req:any,res:any)=>{
    const {name,memberqty,Hours,Amount,Digital_Currency,days,userid,startdate,enddate}=req.body;
     const verify=sleepchallenge.safeParse({name,memberqty,Hours,Amount,Digital_Currency,days});
     if(!verify.success){
       return res.status(400).json({error:verify.error.errors})
     }
     try{
       const challenge= await prisma.challenge.create({
        data:{
            name,
            members:[],
            memberqty,
            Hours,
            Totalamount:0,
            types:"Sleep",
            Amount,
            Digital_Currency,
            days,
            userid,
            PayoutStatus:"pending",
            startdate,
            enddate,
            // Request:[]
        }
     })
    return res.status(201).json({message:"Challenge Created Successfully",challenge},);}
     catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
     }    
})
router.post("/challenge/sleep/private",async(req:any,res:any)=>{
  const {name,memberqty,Hours,Amount,Digital_Currency,days,userid,startdate,enddate,request}=req.body;
   const verify=sleepchallenge.safeParse({name,memberqty,Hours,Amount,Digital_Currency,days});
  console.log("dasdas",request)
   if(!verify.success){
     return res.status(400).json({error:verify.error.errors})
   }
  //  if(request.length+1 !==memberqty){
  //   return res.status(400).json({error:"Select more friends to continue"})
  //  }
   const user=await prisma.user.findUnique({
    where:{
      id:userid
    }
   })
   console.log(user);
   if(user==null){
    return res.status(400).json({message:"User not found"},);
   }
  
   const updatedRequest = [user.username, ...(request || [])];
   console.log("dasd",updatedRequest)
   try{
     const challenge= await prisma.challenge.create({
      data:{
          name,
          members:[],
          memberqty,
          Hours,
          Totalamount:0,
          types:"Sleep",
          Amount,
          Digital_Currency,
          days,
          userid,
          PayoutStatus:"pending",
          startdate,
          type:"private",
          enddate,
          Request:updatedRequest
      }
   })
  return res.status(201).json({message:"Challenge Created Successfully",challenge},);}
   catch(error){
      console.log(error);
      return res.status(500).json({ message: "Error creating Challenge", error });
   }    
})
router.get("/sleep/daily/:userid",async(req:any,res:any)=>{
  const id = req.params.userid;
   if(!id){
    return res.status(500).json({ message: "No id found"});
   }
   const user=await prisma.sleep.findMany({
    where:{
      userid:id
    }
   })
   return res.status(200).json({user})
})
router.post("/sleep/verification",async(req:any,res:any)=>{
    const {startdate,enddate,userid,challengeid}=req.body;
    if(!startdate || !enddate||!userid||!challengeid){
        return res.status(440).json("Required fields ")
    }
    const user=await prisma.sleep.findMany({
        where:{
            userid:userid,  
        }
    })
    const challeng=await prisma.challenge.findUnique({
        where:{
            id:challengeid
        }
    })
    if(!challeng){
        return res.status(400).json({message:"No challenge found for that particular id"})
    }
   const Sleepmap:any={};
   user.map((users)=>{
    Sleepmap[users.day]=users.Hours||"0h 0m"; 
   })   
 console.log(Sleepmap);
 let date=new Date(startdate);
  let confirm=true;
  let i=0
  if(challeng.Hours==null){
    return res.status(400).json({message:"Error"});
  }
  const challengehour = parseDuration(challeng.Hours);
while(i<challeng.days){
    console.log(Sleepmap[date.toISOString().split('T')[0]]);
    const dayhour = parseDuration(Sleepmap[date.toISOString().split('T')[0]]);
    if(dayhour<challengehour){
         confirm=false;
         break;
    }  
    console.log(dayhour);
    console.log(challengehour);
    date.setDate(date.getDate() + 1);
   i++;
}
if(confirm){
    console.log(confirm);
    await prisma.payoutPerson.create({
        data:{
            userId:userid,
            challengeId:challeng.id
        }
    })
    return res.status(200).json({message:"USer successfully completed to the contest"})
}
return res.json({message:"User  fail to complete the test"})
})
router.get("/total/sleep", async (req: any, res: any) => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offset);
    const todayStr = istTime.toISOString().split('T')[0];
    const users = await prisma.user.findMany({
        include: {
            Sleep: {
                where: {
                    day: todayStr 
                },
            }, 
        },
    });
    const formattedSteps = users.map(user => ({
        username: user.username,
        avatar:user.Avatar,
        steps: user.Sleep[0]?.Hours || 0,
    }));
    return res.status(200).json({ data: formattedSteps });
}); 
function parseDuration(duration: string): number {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes; 
}
export const sleeprouter=router;
