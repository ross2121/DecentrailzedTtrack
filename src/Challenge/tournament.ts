import express from "express";
import e, { Router } from "express";
import { challenge } from "../Auth/type";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bs58 from "bs58"
import axios from "axios";
import crypto from "crypto"
import { Transaction,Connection, Keypair, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
const prisma=new PrismaClient();
const connection=new Connection("https://api.devnet.solana.com")
const router=Router();
dotenv.config();
const privatekey=process.env.PRIVATE_KEY;
 const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.CRYPTO_SECRET || 'your-secret', 'salt', 32);
router.post("/create/challenge",async(req:any,res:any)=>{
    const {name,memberqty,Dailystep,Amount,Digital_Currency,days,userid,startdate,enddate}=req.body;
     const verify=challenge.safeParse({name,memberqty,Dailystep,Amount,Digital_Currency,days});
     if(!verify.success){
       return res.status(400).json({error:verify.error.errors})
     }
     try{
       const challenge= await prisma.challenge.create({
        data:{
            name,
            members:[],
            memberqty,
            Dailystep,
            Totalamount:0,
            Amount,
            Digital_Currency,
            days,
            userid,
            PayoutStatus:"pending",
            startdate,
            enddate
        }
     })
     await prisma.user.update({
        where:{
            id:userid
        },data:{
            HistoryCreated:{
                push:challenge.id
            }
        }
     })
     return res.status(201).json({message:"Challenge Created Successfully",challenge},);}
     catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
     }    
})
router.get("/challenge/user/:id",async(req:any,res:any)=>{
    const id=req.params.id;
   const challenge=await prisma.challenge.findUnique({
    where:{
        id:id
    } 
   })
   if(!challenge){
    return  res.status(400).json({message:"No challenge found for a particular id"});
   }
   return res.status(200).json({challenge});
})
router.get("/challenge/public",async(req:any,res:any)=>{
    const allchalange=await prisma.challenge.findMany({
    })
    return res.status(200).json({allchalange});
})

router.get("/challenge/private/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    console.log(userid);
    const allchalange=await prisma.challenge.findMany({
        where:{
            Request:{
                has:userid
            },
            type:"private"
        }
    })
    return res.status(200).json({allchalange});
})
router.get("/history/prevgame/:userid",async(req:any,res:any)=>{
      const useid=req.params.userid;
      const tournatment=await prisma.challenge.findMany({
        where:{
            userid:useid
        }
      })  
      return res.status(200).json({Tournament:tournatment});
})
router.get("/history/prev/:userid",async(req:any,res:any)=>{
    const useid=req.params.userid;
    const tournatment=await prisma.challenge.findMany({
      where:{
          members:{
            has:useid
          }
      }
    })  
    return res.status(200).json({Tournament:tournatment});
})

router.get("/challenge/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    if(!userid){
       return  res.status(400).json({message:"No user id found"});
    }
    const user=await prisma.user.findUnique({
        where:{
            id:userid
        },include:{
            challenge:true
        }
    })
    if(!user){
       return res.status(400).json({message:"No user found"});
    }
    return res.status(200).json({message:user?.challenge});
    

})
router.get("/participated/:userid",async(req:any,res:any)=>{
    const userid=req.params.userid;
    if(!userid){
        res.json({message:"No user found"});
    }
   const user=await prisma.challenge.findMany({
    where:{
         members:userid 
    }
   })
   if(!user){
       return res.status(400).json({message:"No user found for paricular id"})
   } 
   return res.status(200).json({message:user})
})
router.post("/send/wallet",async(req:any,res:any)=>{
    const {tx}=req.body;
    const transaction=Transaction.from(tx.data);
    console.log(transaction);
    const user=await prisma.user.findFirst({
        where:{
           publickey:transaction.signatures[0].publicKey.toBase58()
        }
    })
    console.log("check1");
    console.log("publickey",user?.publickey);
    if(!user){
        res.json({message:"No user found"});
        console.log("no user found");
        return;
    }
    // const bufferfrom=Buffer.from(user.iv,'hex')
    // @ts-ignore
    const iv = Buffer.from(user.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key,iv);
    let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted)
    try{
        await recivetransaction(decrypted,transaction);
        return res.status(200).json({message:"Transaction Successfull"});
    }
    catch(e){
        console.log("failed");
        return res.status(400).json({message:"Transaction failed",e});
    }
})
router.post("/challenge/join/public/:id",async(req:any,res:any)=>{
    const id=req.params.id;
    console.log("id",id);
    const challenge=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challenge){
        console.log("no chalelenn");
        return  res.json({message:"No Challenge found for that particular id"});
       
    }
    if(challenge?.members.length>=challenge?.memberqty){
        return res.status(440).json({message:"Challenge is full"});
    }
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
        console.log("no user found");
        return;
    }
    // @ts-ignore
    const iv = Buffer.from(user.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const userprev=await prisma.challenge.findUnique({
        where:{
            id:challenge.id,
            members:{
                has:user.id
            }
        }
    })
    if(userprev){
        return res.status(500).json({message:"USer alredy added in the contest"});
    }
    try{
        await recivetransaction(decrypted,decoded); 

    }
    catch(e){
        console.log("failed");
        return res.json({message:"Transaction failed",e});
    }
    try{
        await prisma.$transaction(async(prisma)=>{
        
    let ch:boolean=false;
     for(let i=0;i<challenge?.members.length;i++){
        if(challenge.members[i]==user.id){
            ch=true;
        } 
     }
     if(ch){
        console.log("check");
        return res.json({message:"User already exist"});
     }
     const updatechallenge=await prisma.challenge.update({
        where:{
            id
        },data:{
            members:{
                push:user.id
            },
            Totalamount:challenge.Totalamount + challenge.Amount
        }
     })
    console.log("challenge",updatechallenge);
   return res.json({message:"Added to the contest",updatechallenge});
})}catch(error){
    if(!privatekey){
        console.log("nO private key foun");
        return;
    }
    console.log(privatekey);
     const transaction=await revertback(privatekey,decoded.signatures[0].publicKey.toBase58())
     return transaction;
}

})
router.get("/total/steps",async(req:any,res:any)=>{
    const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const users = await prisma.user.findMany({
  include: {
    step: {
      where: {
        day: {
          gte: today.toISOString(),
          lt: tomorrow.toISOString(), 
        },
      },
    },
  },
});

const formattedSteps = users.map(user => ({
  username: user.username,
  steps: user.step[0]?.steps||0 ,
}));

return res.status(200).json({ data: formattedSteps });
})
router.post("/regular/update",async(req:any,res:any)=>{
    const {steps,userid}=req.body;
    if(!steps||!userid){
        return res.status(500).json({message:"No steps or userid found"});
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

const existing = await prisma.steps.findFirst({
  where: {
    userid: user.id,
    day: todayIST,
  },
});

if (existing) {
  await prisma.steps.update({
    where: {
      id: existing.id,
    },
    data: {
      steps: steps,
    },
  });
} else {
  await prisma.steps.create({
    data: {
      userid: user.id,
      steps: steps,
      day: todayIST, // Store IST-adjusted date
    },
  });
}

return res.status(200).json({ message: "Successfully updated the user" });
})
router.post("/challenge/finish", async (req: any, res: any) => {
    const { id } = req.body;
    const privatekey = process.env.PRIVATE_KEY;

    if (!privatekey) {
        return res.status(400).json({ message: "No private key found" });
    }

    const challengee = await prisma.challenge.findUnique({
        where: { id },
    });

    if (!challengee) {
        return res.status(400).json({ message: "No challenge found" });
    }

    const equalamount = challengee.Totalamount / challengee.members.length;

    while (challengee.Payoutpeople.length !== 0) {
        const user = await prisma.user.findUnique({
            where: { id: challengee.Payoutpeople[0] },
        });

        if (!user) {
            return res.status(400).json({ message: "No user found" });
        }

        try {
            console.log("Sending transaction...");
            await sendtrasaction(privatekey, user.publickey, equalamount);
            console.log("Transaction successful");

            await prisma.challenge.update({
                where: { id },
                data: {
                    Totalamount: challengee.Totalamount - equalamount,
                    Payoutpeople: {
                        set: challengee.Payoutpeople.slice(1),
                    },
                },
            });
        } catch (e) {
            console.error("Transaction failed:", e);

            await prisma.challenge.update({
                where: { id },
                data: {
                    Remaingpeople: {
                        push: user.id,
                    },
                    Payoutpeople: {
                        set: challengee.Payoutpeople.slice(1),
                    },
                },
            });
        }
    }

    return res.status(200).json({ message: "contest Ended Successfully" });
});
router.post("/challenge/private",async(req:any,res:any)=>{   
    const {userid,Amount,Digital_Currency,days,Dailystep,memberqty,name,request,startdate,
        enddate}=req.body;
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
        Request:request,
        PayoutStatus:"pending",
        startdate,
            enddate
    }
   })  
   return  res.json({message:"Challenge created succefull"});   
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
    await prisma.$transaction(async(prisma)=>{ 
        // @ts-ignore
        const iv = Buffer.from(user.iv, 'hex');
          const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
        const txs=await recivetransaction(decrypted,decoded);
        if(!txs){
            return res.json({message:"Transactio failed"});
        } 
        await prisma.challenge.update({
            where:{
                id:chaalengeid
            },data:{
                Request:{
                    set: challenge.Request.filter((user)=>user!==username)
                },
                members:{
                    push:user.username
                }
            }
        })
    })
  return  res.status(200).json({message:"User added succe"})
})

async function sendtrasaction(privatekey:string,publicKey:string,Amount:number){
    const decodedKey = bs58.decode(privatekey);
    const keypair=Keypair.fromSecretKey(decodedKey);
    console.log("chekad");
    const transaction=new  Transaction().add(SystemProgram.transfer({
       fromPubkey:keypair.publicKey,
       toPubkey:new PublicKey(publicKey),
       lamports:Amount*LAMPORTS_PER_SOL
    }))
    const send=await connection.sendTransaction(transaction,[keypair]);
    console.log(send);
    return send;
}
async function revertback(privatekey:string,publicKey:string){
    const decodedKey = bs58.decode(privatekey);
   console.log(decodedKey);
    const secretkey=Keypair.fromSecretKey(decodedKey);
    console.log("secrret",secretkey);
     const transaction=new Transaction().add(SystemProgram.transfer({
        fromPubkey:secretkey.publicKey,
        toPubkey:new PublicKey(publicKey),
        lamports:LAMPORTS_PER_SOL
     }))
     const sendtransaction=await sendAndConfirmTransaction(connection,transaction,[secretkey]);
     return sendtransaction;
}
async function recivetransaction(privatekey:string,decoded:Transaction){
    const privateKeyArray = privatekey.split(',').map(num => parseInt(num, 10));
    const uintprivat=new Uint8Array(privateKeyArray);
    const secretkey=Keypair.fromSecretKey(uintprivat);
    const sendtrasaction=await sendAndConfirmTransaction(connection,decoded,[secretkey]);
    console.log(sendtrasaction);
    return sendtrasaction;
}
export const challenges=router;

