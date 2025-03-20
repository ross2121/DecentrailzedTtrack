import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import  { Keypair } from "@solana/web3.js"
import { UserSchema } from "./type";
import bcrypt from "bcrypt"
import assert from "assert";
import crypto from "crypto"
const router=Router();
const prisma=new PrismaClient();
router.post("/register",async(req,res:any)=>{
    const {username,name,email,password}=req.body;
    const verify=UserSchema.safeParse({username,name,email,password});
    if(!verify.success){
        return res.status(400).json({message:"Provided detail are not valid"});
    }
    const unique=await prisma.user.findUnique({
        where:{
            email
        }
    }) 
    if(unique){
        return res.status(400).json({message:"User alredy register"});
    } 
    const uniqueusername=await prisma.user.findUnique({
        where:{
            username
        }
    })
    if(uniqueusername){
        return res.status(400).json({message:"Username alredy taken"});
    }

    const keypair= Keypair.generate();
    try{
    const salt=await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,salt);
    await prisma.$transaction(async(prisma)=>{
        const user=await prisma.user.create({
            data:{
                name,
                email,
                password:hashpassword,
                publickey:keypair.publicKey.toBase58() ,
                 privatekey:keypair.secretKey.toString(),
                username
            }
        }) 
        await prisma.steps.create({
            data:{
                userid:user.id,
                steps:"0",
                day:new Date().toISOString()  
            }
        })
        const token=jwt.sign({id:user.id},"JWTTOKEN",{expiresIn:365});
        return res.status(200).json({token,user});
    })  
}catch(e){
    return res.status(400).json({message:e});
}}
)
router.post("/signin",async(req:any,res:any)=>{
    const {email,password}=req.body;
    if(!email||!password){
        res.status(200).json({message:"Kindly provide the  required detail", status:400},)
    }
    const user=await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        res.status(200).json({message:"No user find kindly register",status:400});
        return;
    }
    const comparepassword=bcrypt.compareSync(password,user?.password);
    if(!comparepassword){
       res.json({message:"Password dont match"});
    }
    const token=jwt.sign({id:user.id},"JWTOKEN");
    return res.status(200).json({token,user});
})
export const userrouter=router;
