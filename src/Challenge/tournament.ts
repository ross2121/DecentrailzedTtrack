import express from "express";
import e, { Router } from "express";
import { challenge } from "../Auth/type";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Transaction,Connection, Keypair, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
const prisma=new PrismaClient();
const connection=new Connection("https://api.devnet.solana.com")
const router=Router();
dotenv.config();
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
            Totalamount:0,
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
router.get("/challenge/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    if(!userid){
        res.json({message:"No user id found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        },include:{
            challenge:true
        }
    })
    if(!user){
        res.json({message:"No user found"});
    }
    return res.json({user});
    

})
router.get("/participated/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    if(!userid){
        res.json({message:"No user found"});
    }
    
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
    const trx=await recivetransaction(user.privatekey,decoded); 
    if(!trx){
        return res.json({message:"Transaction failed"});
    }
    const challenge=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challenge){
        res.json({message:"No Challenge found for that particular id"},{status:400});
        return;
    }
    challenge?.members.push(user.id);
    
    challenge.Totalamount+=challenge?.Amount;
   res.json({message:"Added to the contest"},{challenge});
})
router.post("/step/update",async(req:any,res:any)=>{
    const {date,step,userid}=req.body;
    if(!date||!step||!userid){
        res.json({message:"Kindly provide required details"})
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        }
    })
    if(!user){
        res.json({message:"No user found"})
    }
    const steps=await prisma.steps.create({
        data:{
            day:date,
            steps:step,
            userid:userid
        }
    }) 
   return res.status(200).json({steps});
})
router.post("/regular/update",async(req:any,res:any)=>{
    const {steps,userid}=req.body;
    if(!steps||!userid){
        res.json({message:"No steps or userid found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        },include:{
            challenge:true
        }
        
    })
    if(!user){
        res.json({message:"No user found"});
        return;
    }
    for(let i=0;i<user?.challenge.length;i++){
        if(user?.challenge[i].Dailystep>steps){
            user.challenge[i].members = user.challenge[i].members.filter(member =>member[i]!== user.id);
        }
    }
    res.json({message:"Succesfully include the user"}); 
})
router.post("/challenge/finish",async(req:any,res:any)=>{
    const {id}=req.body;
    const privatekey=process.env.PRIVATE_KEY;
    if(!privatekey){
        res.json({message:"No private key found"},{status:400});
        return;
    }
    const challengee=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challengee){
        res.json({message:"No challenge found"});
        return;
    }
    const equalamount=challengee?.members.length/challengee?.Totalamount;
    for(let i=0;i<challengee?.members.length;i++){
         const user=await prisma.user.findUnique({
            where:{
                id:challengee?.members[i]
            }
         }) 
         if(!user){
            res.json({message:"No user found"});
            return;
         }
         if(!challengee?.Totalamount){
            return;
         }
        const send= await sendtrasaction(privatekey,user.publickey,equalamount); 
         if(send){
            challengee.Totalamount-=challengee?.Amount;  
         }
         console.log(send); 
    }
    res.json({message:"contest Ended Succefully"});
})
router.post("/challenge/private",async(req:any,res:any)=>{   
    const {userid,Amount,Digital_Currency,days,Dailystep,memberqty,name,members}=req.body;
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        }
    })
    if(!user){
        res.json({message:"No user found for paticular id"});
    }
   await prisma.challenge.create({
    data:{
        userid:userid,
        Amount,
        Digital_Currency,
        Dailystep,
        days,
        memberqty,
        Totalamount:0,
        type:"private",
        members:[],
        name,
        Request:members
    }
   })  
    res.json({message:"Challenge created succefull"});   
})
router.post("/challenge/acceptchallenge",async(req:any,res:any)=>{
    const {chaalengeid,userid,username,tx}=req.body;
    const decoded=Transaction.from(tx);
    if(!chaalengeid||!userid||!username){
        res.json({message:"No challenge or userid username found"});
    }
    const challenge=await prisma.challenge.findUnique({
        where:{
            id:chaalengeid
        }
    })
    const user=await prisma.user.findUnique({
        where:{
            username
        }
    })
    if(!user){
        return res.json({message:"No user find"});

    }
    if(!chaalengeid){
        res.json({message:"No challenge found for pricular that particular id"});
        return;
    }
    if(!challenge?.Request[username]){
        res.json({message:"You were not added to the Challenge Kindly ask the user to add you to challenge"});
        return;
    }
    const txs=await recivetransaction(user.privatekey,decoded);
    if(!txs){
        return res.json({message:"Transactio failed"});
    }  
    challenge.Request.filter((user)=>user!==username);
    challenge.members.push(username);
    res.json({message:"User added succe"})
})
router.post("/challenge/private/finish",async(req,res)=>{
    const {id}=req.body;
    const privatekey=process.env.PRIVATE_KEY;
    if(!privatekey){
        res.json({message:"No private key found"});
        return;
    }
    const challengee=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challengee){
        res.json({message:"No challenge found"});
        return;
    }
    const equalamount=challengee?.members.length/challengee?.Totalamount;
    for(let i=0;i<challengee?.members.length;i++){
         const user=await prisma.user.findUnique({
            where:{
                id:challengee?.members[i]
            }
         }) 
         if(!user){
            res.json({message:"No user found"});
            return;
         }
         if(!challengee?.Totalamount){
            return;
         }
        const send= await sendtrasaction(privatekey,user.publickey,equalamount); 
         if(send){
            challengee.Totalamount-=challengee?.Amount;  
         }
         console.log(send); 
    }
    res.json({message:"contest Ended Succefully"});

})
async function sendtrasaction(privatekey:string,publicKey:string,Amount:number){
    const encoder=new TextEncoder();
    const encoded=encoder.encode(privatekey);
    const keypair=Keypair.fromSecretKey(encoded);
    const transaction=new  Transaction().add(SystemProgram.transfer({
       fromPubkey:keypair.publicKey,
       toPubkey:new PublicKey(publicKey),
       lamports:Amount*LAMPORTS_PER_SOL
    }))
    const send=await connection.sendTransaction(transaction,[keypair]);
    return send;
}
async function recivetransaction(privatekey:string,decoded:Transaction){
    const privateKeyArray = privatekey.split(',').map(num => parseInt(num, 10));
    const uintprivat=new Uint8Array(privateKeyArray);
    const secretkey=Keypair.fromSecretKey(uintprivat);
    const sendtrasaction=await sendAndConfirmTransaction(connection,decoded,[secretkey]);
    return sendtrasaction;
}
export const challenges=router;

