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
exports.userrouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const web3_js_1 = require("@solana/web3.js");
const type_1 = require("./type");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, email, password } = req.body;
    const verify = type_1.UserSchema.safeParse({ username, name, email, password });
    if (!verify.success) {
        return res.status(400).json({ message: verify.error.errors, });
    }
    const unique = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (unique) {
        return res.status(400).json({ message: [{ message: "User alredy exist Kindly Login" }] });
    }
    const uniqueusername = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (uniqueusername) {
        return res.status(400).json({ message: [{ message: "Username alredy exist.Kindly change it" }] });
    }
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
