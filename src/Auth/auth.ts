import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import  { Keypair } from "@solana/web3.js"
import { LoginSchema, UserSchema } from "./type";
import bcrypt from "bcrypt";
import crypto from "crypto"
import otp from "otp-generator"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();
const router=Router();
const prisma=new PrismaClient();
export const tranporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
    },
    port:465,
    secure:false,
    host:'smtp.gmail.com'
})
router.post("/register",async(req,res:any)=>{
    const {username,name,email,password}=req.body;
    const verify=UserSchema.safeParse({username,name,email,password});
    if(!verify.success){
        return res.status(400).json({message:verify.error.errors,});
    }
    const uniqueusername=await prisma.user.findUnique({
        where:{
            username
        }
    })
    if(uniqueusername){
        return res.status(400).json({message:[{message:"Username alredy exist.Kindly change it"}]});
    }
    const unique=await prisma.user.findUnique({
        where:{
            email
        }
    }) 
    if(unique){
        return res.status(400).json({message:[{message:"User alredy exist Kindly Login"}]});
    } 
    await generaotp(req, res);

    res.status(200).json({ message: "OTP sent. Please verify to complete registration." });  

}
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
router.post("/verify",async(req:any,res:any)=>{
    const { code, name, email, password ,username} = req.body;
    console.log("Received OTP:", code);
    console.log("User data:", { name, email, password });
    if (parseInt(code) === parseInt(req.app.locals.OTP)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
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
    const avatarurl = [
        "https://img.freepik.com/free-photo/beautiful-anime-new-year-s-eve-scene_23-2151038098.jpg?t=st=1746870065~exp=1746873665~hmac=55afbb911dc28ac3ada8c13095a482f5b960b3291feb37f15100a4c824b78c43&w=1800",
        "https://img.freepik.com/free-photo/illustration-anime-character-rain_23-2151394695.jpg?t=st=1746870090~exp=1746873690~hmac=e3f8f68015a9dff61b9060caca6eda4ec47aa1c07f217f93cb9d692e63211c3a&w=1800",
        "https://img.freepik.com/premium-vector/young-explorer-editable-colors-anime-vector_1257632-131.jpg?w=900",
        "https://img.freepik.com/free-vector/hand-drawn-anime-kawaii-illustration_52683-123747.jpg?t=st=1746870157~exp=1746873757~hmac=41d188d51d62c1433595ce432245ca270c98ee8dda8addf7dbbbc03496373765&w=900",
        "https://img.freepik.com/premium-vector/sad-young-anime-boy-black-outfit-vector-isolated-illustration_419911-1834.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/androgynous-avatar-non-binary-queer-person_23-2151100224.jpg?t=st=1746870210~exp=1746873810~hmac=4f41078428b650dd918fa7689a2a822417bc53797135e7c6b7327e2b966327fb&w=900",
        "https://img.freepik.com/free-photo/anime-style-chinese-new-year-celebration-scene_23-2151079957.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/anime-character-winter_23-2151843502.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740",
        "https://img.freepik.com/premium-photo/chubby-cute-boy-sneakers-black-hoodie_1003686-46095.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/anime-character-celebrating-christmas_23-2150970289.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/medium-shot-anime-style-man-portrait_23-2151067428.jpg?ga=GA1.1.437260065.1746285969&semt=ais_hybrid&w=740"
    ];
    const randomAvatar = avatarurl[Math.floor(Math.random() * avatarurl.length)];
    await prisma.$transaction(async(prisma)=>{
        const user=await prisma.user.create({
            data:{
                name,
                email,
                password:hashpassword,
                publickey:keypair.publicKey.toBase58() ,
                 privatekey:encrypted,
                username,
                Avatar:randomAvatar,
                iv:iv.toString('hex')
            }
        })
        const token=jwt.sign({id:user.id},"JWTTOKEN",{expiresIn:365});
        return res.status(200).json({token,user});})
    }catch(e){
        return res.status(400).json({message:e});
    }
}
})
export const  generaotp=async(req:any,res:any)=>{
    req.app.locals.OTP= otp.generate(6,{upperCaseAlphabets:false,specialChars:false,lowerCaseAlphabets:false,digits:true});
   console.log(req.app.locals.OTP)
const {name,email}=req.body
console.log(email);

const verifyotp={
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Solara App - Account Verification OTP',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #3b82f6; font-size: 24px; font-weight: 600;">Welcome to Solara</h1>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: white; font-size: 20px; text-align: center; margin: 0;">Your Verification Code</h2>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <div style="display: inline-block; background-color: #f3f4f6; padding: 15px 30px; border-radius: 6px; border: 1px dashed #d1d5db;">
                  <span style="font-size: 28px; font-weight: 600; color: #3b82f6; letter-spacing: 2px;">${req.app.locals.OTP}</span>
                </div>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
                Hello ${name},
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
                Thank you for signing up with Solara! To complete your account verification, please enter the following one-time password (OTP) in the app:
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email or contact support if you have concerns.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 13px; text-align: center;">
                  Need help? Contact our support team at <a href="mailto:support@solara.app" style="color: #3b82f6; text-decoration: none;">support@solara.app</a>
                </p>
              </div>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Solara App. All rights reserved.
              </p>
            </div>
          </div>
        `
      
};
;
// console.log(reason);

    try{tranporter.sendMail(verifyotp,(err)=>{
        if(err){
            res.send(err);
        }
        else{
            return res.status(200).send({message:"OTP Sent"});
        }
    })
}catch(error){
    console.log(error);
    }
}


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
