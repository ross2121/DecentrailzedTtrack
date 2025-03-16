import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router=Router();
const prisma=new PrismaClient();
router.post("/add/friend",async(req:any,res:any)=>{
   const {username,userid}=req.body;
   if(!username||!userid){
    res.json({message:"No username or userid found"});
   }
   const users=await prisma.user.findUnique({
    where:{
        id:userid
    }
   })
   if(!users){
    res.json({message:"No user found for this particular id"})
   }
   const user=await prisma.user.findUnique({
      where:{
        username
      }
   }) 
   if(!user){
    res.json({message:"No user found"});
   }
   await prisma.user.update({
    where:{
        id:userid
    },data:{
        Request:{
            push:username,
        }
    }
   })   
    await prisma.user.update({
        where:{
            username:username
        },data:{
            Request:{
                push:users?.username
            }
        }
    })
   res.json({message:"Requested send to you friend"});
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
router.post("/accept/friend",async(req:any,res:any)=>{
    const  {userid,username,bool}=req.body;
    if(!userid){
        res.json({message:"No userid found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid,
        }
    })
    if(!user){
        res.json({message:"No user found for that particular id"});
    }
    const friend=user?.Request.map((frin)=>frin==username);
    if(!friend){
        res.json({messsage:"No user found for that paricular id"});
    }
    if(bool){
        user?.Request.filter(el=>el!==username);
        user?.Friends.push(username);
        res.json({message:"Friend is added your list"})
    }else{
        user?.Request.filter(el=>el!==username);
        res.json({message:"User removed from you list"});
    }
})
export const Friend=router;