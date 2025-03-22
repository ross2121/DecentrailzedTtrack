import jwt from "jsonwebtoken"
import {Request,Response,NextFunction} from "express"
const string=process.env.JWT_SECRET||"abc";
export const auth=async(req:Request,res:Response,next:NextFunction)=>{
   try {
    if(!req.headers.authorization) {
        throw new Error("Authantication error");
    }
    const token = req.headers.authorization as unknown as string;
    if(!token){
        throw new Error("Authoriazation error");
    }
    const decode= jwt.verify(token,string as string);
    // @ts-ignore
    req.id=decode.id;
    next();
   } catch (error) {
    console.log(error);
    res.status(402).json({error});
   }
}