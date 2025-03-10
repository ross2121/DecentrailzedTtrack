import express from "express";
import { Router } from "express";
import { challenge } from "../Auth/type";
import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
const router=Router();
router.post("/create/challenge",async(req:any,res:any)=>{
    const {name,memberqty,Dailystep,Amount,Digital_Currency,days,userid}=req.body;
     const verify=challenge.safeParse({name,memberqty,Dailystep,Amount,Digital_Currency,days});
     if(!verify.success){
        res.json({message:"Provided detail are not valid"},{status:400});
     }
     try{await prisma.challenge.create({
        data:{
            name,
            members:[],
            memberqty,
            Dailystep,
            Amount,
            Digital_Currency,
            days,
            userid
        }
     })
     res.json({message:"Challange Created Successfully"},{staus:200})}
     catch(error){
        console.log(error);
        res.json({message:"Error creating Challange"},{error});
     }    
})
router.get("/challenge/:id",async(req:any,res:any)=>{
    const id=req.query;
   const challenge=await prisma.challenge.findUnique({
    where:{
        id:id
    }
   
   })
   if(!challenge){
      res.json({message:"No challenge found for a particular id"},{status:400});
   }
   res.json({challenge},{status:200});
})
router.get("/challenge",async(req:any,res:any)=>{
    const allchalange=await prisma.challenge.findMany({
    })
    res.json({allchalange});
})
router.get("/challenge/join/:id",async(req:any,res:any)=>{
    const id=req.query;
    const userid=req.body;
    const challenge=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challenge){
        res.json({message:"No Challenge found for that particular id"},{status:400});
    }
    challenge?.members.push(userid);
})
