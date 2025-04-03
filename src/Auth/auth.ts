import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import  { Keypair } from "@solana/web3.js"
import { LoginSchema, UserSchema } from "./type";
import bcrypt from "bcrypt";
import crypto from "crypto"
const router=Router();
const prisma=new PrismaClient();
router.post("/register",async(req,res:any)=>{
    const {username,name,email,password}=req.body;
    const verify=UserSchema.safeParse({username,name,email,password});
    if(!verify.success){
        return res.status(400).json({message:verify.error.errors,});
    }
    const unique=await prisma.user.findUnique({
        where:{
            email
        }
    }) 
    if(unique){
        return res.status(400).json({message:[{message:"User alredy exist Kindly Login"}]});
    } 
    const uniqueusername=await prisma.user.findUnique({
        where:{
            username
        }
    })
    if(uniqueusername){
        return res.status(400).json({message:[{message:"Username alredy exist.Kindly change it"}]});
    }
    const keypair= Keypair.generate();
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.CRYPTO_SECRET || 'your-secret', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(keypair.secretKey.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex')
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
                 privatekey:encrypted,
                username,
                iv:iv.toString('hex')
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
    const verify=LoginSchema.safeParse({email,password});
    if(!verify.success){
        return res.status(400).json({error:verify.error.errors});
    }
    const user=await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        return res.status(400).json({message:[{message:"NO user found kindly register"}]});
        
    }
    const comparepassword=bcrypt.compareSync(password,user?.password);
    if(!comparepassword){
        return res.status(400).json({message:[{message:"PASSWORD IS INCORRECT"}]});
    }
    const token=jwt.sign({id:user.id},"JWTOKEN");
    return res.status(200).json({token,user});
})
// router.get("/all/users",async(req:any,res:any)=>{
//     const user=await prisma.user.findMany({});
//     return res.json({username:user.map((user)=>user.username)});
// })


router.get("/all/users/:userid", async (req: any, res: any) => {
    try {
        const searchTerm = req.query.search as string;
        const userid = req.params.userid;
        const currentUser = await prisma.user.findUnique({
            where: { id: userid },
            select: {
                RequestFriend: true,
                 Friends: true
            }
        });
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: userid } },
                    searchTerm ? {
                        username: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    } : {}
                ]
            },
            select: {
                id: true,
                username: true
            }
        });
        const usersWithStatus = users.map(user => {
            let status = "ADD";
            if (currentUser?.RequestFriend?.includes(user.username)) {
                status = "requested";
            } else if (currentUser?.Friends?.includes(user.username)) {
                status = "accepted";
            }
            return {
                id: user.id,
                username: user.username,
                status
            };
        });

        return res.status(200).json({
            success: true,
            users: usersWithStatus
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to fetch users"
        });
    }
});

export const userrouter=router;
