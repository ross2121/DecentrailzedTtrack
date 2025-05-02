"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userrouter = exports.generaotp = exports.tranporter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const web3_js_1 = require("@solana/web3.js");
const type_1 = require("./type");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.tranporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    port: 465,
    secure: false,
    host: 'smtp.gmail.com'
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, email, password } = req.body;
    const verify = type_1.UserSchema.safeParse({ username, name, email, password });
    if (!verify.success) {
        return res.status(400).json({ message: verify.error.errors, });
    }
    const uniqueusername = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (uniqueusername) {
        return res.status(400).json({ message: [{ message: "Username alredy exist.Kindly change it" }] });
    }
    const unique = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (unique) {
        return res.status(400).json({ message: [{ message: "User alredy exist Kindly Login" }] });
    }
    yield (0, exports.generaotp)(req, res);
    res.status(200).json({ message: "OTP sent. Please verify to complete registration." });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const verify = type_1.LoginSchema.safeParse({ email, password });
    if (!verify.success) {
        return res.status(400).json({ error: verify.error.errors });
    }
    const user = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        return res.status(400).json({ message: [{ message: "NO user found kindly register" }] });
    }
    const comparepassword = bcrypt_1.default.compareSync(password, user === null || user === void 0 ? void 0 : user.password);
    if (!comparepassword) {
        return res.status(400).json({ message: [{ message: "PASSWORD IS INCORRECT" }] });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, "JWTOKEN");
    return res.status(200).json({ token, user });
}));
// router.get("/all/users",async(req:any,res:any)=>{
//     const user=await prisma.user.findMany({});
//     return res.json({username:user.map((user)=>user.username)});
// })
router.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, name, email, password, username } = req.body;
    console.log("Received OTP:", code);
    console.log("User data:", { name, email, password });
    if (parseInt(code) === parseInt(req.app.locals.OTP)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        const keypair = web3_js_1.Keypair.generate();
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(process.env.CRYPTO_SECRET || 'your-secret', 'salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(keypair.secretKey.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        try {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashpassword = yield bcrypt_1.default.hash(password, salt);
            yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashpassword,
                        publickey: keypair.publicKey.toBase58(),
                        privatekey: encrypted,
                        username,
                        iv: iv.toString('hex')
                    }
                });
                const token = jsonwebtoken_1.default.sign({ id: user.id }, "JWTTOKEN", { expiresIn: 365 });
                return res.status(200).json({ token, user });
            }));
        }
        catch (e) {
            return res.status(400).json({ message: e });
        }
    }
}));
const generaotp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.app.locals.OTP = otp_generator_1.default.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
    console.log(req.app.locals.OTP);
    const { name, email } = req.body;
    console.log(email);
    const verifyotp = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Account verification OTP',
        html: ` <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
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
    try {
        exports.tranporter.sendMail(verifyotp, (err) => {
            if (err) {
                res.send(err);
            }
            else {
                return res.status(200).send({ message: "OTP Sent" });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.generaotp = generaotp;
router.get("/all/users/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchTerm = req.query.search;
        const userid = req.params.userid;
        const currentUser = yield prisma.user.findUnique({
            where: { id: userid },
            select: {
                RequestFriend: true,
                Friends: true
            }
        });
        const users = yield prisma.user.findMany({
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
            var _a, _b;
            let status = "ADD";
            if ((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.RequestFriend) === null || _a === void 0 ? void 0 : _a.includes(user.username)) {
                status = "requested";
            }
            else if ((_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.Friends) === null || _b === void 0 ? void 0 : _b.includes(user.username)) {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to fetch users"
        });
    }
}));
exports.userrouter = router;
