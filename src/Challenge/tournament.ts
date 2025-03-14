import express from "express";
import { Router } from "express";
import { challenge } from "../Auth/type";
import { PrismaClient } from "@prisma/client";
import { Transaction,Connection, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
const prisma=new PrismaClient();
const connection=new Connection("https://api.devnet.solana.com")
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
router.post("/challenge/join/:id",async(req:any,res:any)=>{
    const id=req.query.id;
    const tx=req.body.tx;
    const decoded=Transaction.from(tx.data);
    console.log("decoded",decoded); 
    const user=await prisma.user.findFirst({
        where:{
           publickey:decoded.signatures[0].publicKey.toBase58()
        }
    })
    console.log("publickey",user?.publickey);
    if(!user){
        res.json({message:"No user found"});
        return;
    }
    const privateKeyArray = user.privatekey.split(',').map(num => parseInt(num, 10));
    const uintprivat=new Uint8Array(privateKeyArray);
    const secretkey=Keypair.fromSecretKey(uintprivat);
    const sendtrasaction=await sendAndConfirmTransaction(connection,decoded,[secretkey]);
    const status=await connection.getParsedTransaction(sendtrasaction);
    const challenge=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challenge){
        res.json({message:"No Challenge found for that particular id"},{status:400});
    }
    challenge?.members.push(user.id);
})
export const challenges=router;

