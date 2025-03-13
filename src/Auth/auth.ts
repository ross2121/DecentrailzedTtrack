import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import  { Keypair } from "@solana/web3.js"
import { UserSchema } from "./type";
import bcrypt from "bcrypt"
const router=Router();
const prisma=new PrismaClient();
router.post("/register",async(req,res:any)=>{
    const {username,name,email,password}=req.body;
    const verify=UserSchema.safeParse({username,name,email,password});

    if(verify.error){
        res.json({message:"Provided detail are not valid"},{status:400});
    }
    const unique=await prisma.user.findUnique({
        where:{
            email
        }
    }) 
    if(unique){
        res.json({message:"User alredy register",status:400});
    }
    const keypair= Keypair.generate();
    const salt=await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,salt);
    const hashedprivatekey=await bcrypt.hash(keypair.secretKey.toString(),salt);
    const user=await prisma.user.create({
        data:{
            name,
            email,
            password:hashpassword,
            publickey:keypair.publicKey.toBase58() ,
             privatekey:hashedprivatekey,
            username
        }
    }) 
    const token=jwt.sign({id:user.id},"JWTTOKEN",{expiresIn:365});
    res.json({token,user,status:200});
})
router.post("/signin",async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        res.json({message:"Kindly provide the  required detail", status:400},)
    }
    const user=await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        res.json({message:"No user find kindly register",status:400});
        return;
    }
    const comparepassword=bcrypt.compareSync(password,user?.password);
    if(!comparepassword){
       res.json({message:"Password dont match"});
    }
    const token=jwt.sign({id:user.id},"JWTOKEN");
    res.json({token});
})
export const userrouter=router;
