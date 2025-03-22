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
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, email, password } = req.body;
    const verify = type_1.UserSchema.safeParse({ username, name, email, password });
    if (!verify.success) {
        return res.status(400).json({ message: verify.error.message, });
    }
    const unique = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (unique) {
        return res.status(400).json({ message: "User alredy register" });
    }
    const uniqueusername = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (uniqueusername) {
        return res.status(400).json({ message: "Username alredy taken" });
    }
    const keypair = web3_js_1.Keypair.generate();
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
                    privatekey: keypair.secretKey.toString(),
                    username
                }
            });
            yield prisma.steps.create({
                data: {
                    userid: user.id,
                    steps: "0",
                    day: new Date().toISOString()
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
        return res.status(400).json({ message: verify.error.message, });
    }
    const user = yield prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        res.status(200).json({ message: "No user find kindly register", status: 400 });
        return;
    }
    const comparepassword = bcrypt_1.default.compareSync(password, user === null || user === void 0 ? void 0 : user.password);
    if (!comparepassword) {
        res.json({ message: "Password dont match" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, "JWTOKEN");
    return res.status(200).json({ token, user });
}));
router.get("/test/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    res.json({ message: userid });
}));
exports.userrouter = router;
