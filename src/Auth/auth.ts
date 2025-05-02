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
    from:process.env.EMAIL_USERNAME,
    to:email,
    subject:'Account verification OTP',
    html:` <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
    <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Verify Your ERP Inventory Manager Account</h1>
    <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
            <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Inventory Manager Verification Code</h2>
            <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear Inventory Manager ${name},</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Thank you for creating an ERP Inventory Manager account. To activate your account, please enter the following verification code:</p>
            <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #854CE6;">${req.app.locals.OTP}</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the ERP system to activate your Inventory Manager account.</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not create an ERP Inventory Manager account, please disregard this email.</p>
        </div>
    </div>
    <br>
    <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The ERP System Team</p>
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
