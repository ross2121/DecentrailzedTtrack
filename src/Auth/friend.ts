import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router=Router();
const prisma=new PrismaClient();
router.post("/add/friend",async(req:any,res:any)=>{
   const {username,userid}=req.body;
   if(!username||!userid){
   return  res.status(400).json({message:"No username or userid found"});
   }
   const users=await prisma.user.findUnique({
    where:{
        id:userid
    }
   })
   if(!users){
    return res.status(500).json({message:"No user found for this particular id"})
   }
   const user=await prisma.user.findUnique({
      where:{
        username
      }
   }) 
   if(!user){
    res.json({message:"No user found"});
   }  
   console.log("HCke"); 
    await prisma.user.update({
        where:{
            username:username
        },data:{
            Request:{
                push:users?.username
            }
        }
    })
    await prisma.user.update({
        where:{
            id:userid
        },data:{
            Notification:
             {push:`Friend request from ${user?.username}`}
        }
    })
   return res.status(200).json({message:"Requested send to you friend"});
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
router.post("/tews",async(req:any,res:any)=>{
    await prisma.challenge.update({
       where:{
        id:"28872c8e-56e8-4e3e-ba29-03174444db19"
       },data:{
          Payoutpeople:{
            push:"a2fa595c-b063-4c36-ad03-c3fbb284309a"
          } 
       }
    })
    return res.json({message:"pushed succesfully"});
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
router.get("/test/test",async(req:any,res:any)=>{
    
    return res.json({message:"Checkeddd "})
})
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
        await prisma.user.update({
            where:{
                id:userid,
            },data:{
                Friends:{
                    push:username
                }
            }
        })
        await prisma.user.update({
            where:{
                id:userid,
            },data:{
                Request:{
                    set:user.Request.filter(el=>el!==username)
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