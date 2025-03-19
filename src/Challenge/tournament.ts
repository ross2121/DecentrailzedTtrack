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
       return res.json({error:verify.error.errors})
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
     return res.status(201).json("Challenge Created Successfully");}
     catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
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
    return  res.status(400).json({message:"No challenge found for a particular id"},{status:400});
   }
   return res.status(200).json({challenge});
})
router.get("/challenge/public",async(req:any,res:any)=>{
    const allchalange=await prisma.challenge.findMany({
        where:{
            type:"public"
        }
    })
    return res.status(200).json({allchalange});
})
router.get("/challenge/private",async(req:any,res:any)=>{
    const allchalange=await prisma.challenge.findMany({
        where:{
            type:"private"
        }
    })
    return res.status(200).json({allchalange});
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
    return res.status(200).json({user});
    

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

   } 
   return res.status(200).json({message:user})
})
router.post("/challenge/join/:id",async(req:any,res:any)=>{
    const id=req.params.id;
    console.log("id",id);
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
    const trx=await recivetransaction(user.privatekey,decoded); 
    if(!trx){
        console.log("failed");
        return res.json({message:"Transaction failed"});
    }
    const challenge=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challenge){
        console.log("no chalelenn");
        return  res.json({message:"No Challenge found for that particular id"});
       
    }
    let ch:boolean=false;
     for(let i=0;i<challenge?.members.length;i++){
        if(challenge.members[i]==user.id){
            ch=true;
        }
     }
     if(ch){
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
    console.log("challenge",challenge);
   return res.json({message:"Added to the contest",updatechallenge});
})

router.get("total/steps",async(req:any,res:any)=>{
    const user=await prisma.user.findMany({
          include:{
            step:true
          }
    })
    return res.status(200).json({user});
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
    if(!user){
       return  res.status(500).json({message:"No user found"});
    
    }
     await prisma.steps.update({
        where:{
            id:user.id
        },
        data:{
            steps:steps,
            day:new Date().toISOString()
        }
     })
    return res.status(200).json({message:"Succesfully updated the user"}); 
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
    await prisma.$transaction(async(prisma)=>{
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
           await prisma.challenge.update({
            where:{
                id
            },
            data:{
                Totalamount:challengee.Totalamount - equalamount
            }
           })
            // console.log(send); 
       }
    })
   return res.status(200).json({message:"contest Ended Succefully"});
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
        const txs=await recivetransaction(user.privatekey,decoded);
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
router.post("/challenge/private/finish",async(req:any,res:any)=>{
    const {id}=req.body;
    const privatekey=process.env.PRIVATE_KEY;
    if(!privatekey){
        res.json({message:"No private key found"});
        return;
    }
    try{const challengee=await prisma.challenge.findUnique({
        where:{
            id
        }
    })
    if(!challengee){
        res.json({message:"No challenge found"});
        return;
    }
    const equalamount=challengee?.members.length/challengee?.Totalamount;
    await prisma.$transaction(async(prisma)=>{
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
            await prisma.challenge.update({
                where:{
                    id
                },data:{
                    Totalamount: challengee.Totalamount - equalamount
                }
            })
            console.log(send);  
        }
    })
    return res.json({message:"contest Ended Succefully"});
}catch(e:any){
    console.error("Error during payout:", e);
    return res.status(500).json({ message: "Failed to complete payout", error: e.message });       
    }
   

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
    console.log(send);
    return send;
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

