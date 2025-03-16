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
        return res.json({message:"Provided detail are not valid"});
    }
    const unique=await prisma.user.findUnique({
        where:{
            email
        }
    }) 
    if(unique){
        return res.json({message:"User alredy register"});
    }
    const keypair= Keypair.generate();
//     const nonce=crypto.randomBytes(16);
//     const tex="password";
//     let ciphertex;
// crypto.pbkdf2(tex, 'salt', 100000, 16, 'sha256', (err:any, derivedKey:any) => {
//     if (err) throw err;
//     const cipher = crypto.createCipheriv("aes-128-gcm", derivedKey, nonce);
//      ciphertex = Buffer.concat([cipher.update(keypair.secretKey.toString()), cipher.final()]);
//     const authTag = cipher.getAuthTag();  
//     console.log(ciphertex);
//     console.log(authTag);
// });
// if(!ciphertex){
//     return;
// }
    const salt=await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,salt);
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
    const token=jwt.sign({id:user.id},"JWTTOKEN",{expiresIn:365});
    return res.json({token,user});
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
    res.json({token,user});
})
export const userrouter=router;
