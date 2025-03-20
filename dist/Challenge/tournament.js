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
exports.challenges = void 0;
const express_1 = require("express");
const type_1 = require("../Auth/type");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const prisma = new client_1.PrismaClient();
const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
const router = (0, express_1.Router)();
dotenv_1.default.config();
const privatekey = process.env.PRIVATE_KEY;
router.post("/create/challenge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberqty, Dailystep, Amount, Digital_Currency, days, userid } = req.body;
    const verify = type_1.challenge.safeParse({ name, memberqty, Dailystep, Amount, Digital_Currency, days });
    if (!verify.success) {
        return res.json({ error: verify.error.errors });
    }
    try {
        const challenge = yield prisma.challenge.create({
            data: {
                name,
                members: [],
                memberqty,
                Dailystep,
                Totalamount: 0,
                Amount,
                Digital_Currency,
                days,
                userid,
                PayoutStatus: "false",
            }
        });
        return res.status(201).json({ message: "Challenge Created Successfully", challenge });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
    }
}));
router.get("/challenge/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id: id
        }
    });
    if (!challenge) {
        return res.status(400).json({ message: "No challenge found for a particular id" });
    }
    return res.status(200).json({ challenge });
}));
router.get("/challenge/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allchalange = yield prisma.challenge.findMany({});
    return res.status(200).json({ allchalange });
}));
router.get("/challenge/private", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allchalange = yield prisma.challenge.findMany({
        where: {
            type: "private"
        }
    });
    return res.status(200).json({ allchalange });
}));
router.post("/step", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const steps = req.body;
    if (!steps) {
        console.log("noooooooo");
        return res.json("no  dadasd");
    }
    console.log(steps);
    console.log("heieie");
    return res.json({ message: "nodosod" });
}));
router.get("/challenge/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    if (!userid) {
        return res.status(400).json({ message: "No user id found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid
        }, include: {
            challenge: true
        }
    });
    if (!user) {
        return res.status(400).json({ message: "No user found" });
    }
    return res.status(200).json({ message: user === null || user === void 0 ? void 0 : user.challenge });
}));
router.get("/participated/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    if (!userid) {
        res.json({ message: "No user found" });
    }
    const user = yield prisma.challenge.findMany({
        where: {
            members: userid
        }
    });
    if (!user) {
        return res.status(400).json({ message: "No user found for paricular id" });
    }
    return res.status(200).json({ message: user });
}));
router.post("/challenge/join/public/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log("id", id);
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id
        }
    });
    if (!challenge) {
        console.log("no chalelenn");
        return res.json({ message: "No Challenge found for that particular id" });
    }
    if ((challenge === null || challenge === void 0 ? void 0 : challenge.members.length) >= (challenge === null || challenge === void 0 ? void 0 : challenge.memberqty)) {
        return res.status(440).json({ message: "Challenge is full" });
    }
    const tx = req.body.tx;
    const decoded = web3_js_1.Transaction.from(tx.data);
    console.log("decoded", decoded);
    const user = yield prisma.user.findFirst({
        where: {
            publickey: decoded.signatures[0].publicKey.toBase58()
        }
    });
    console.log("publickey", user === null || user === void 0 ? void 0 : user.publickey);
    if (!user) {
        res.json({ message: "No user found" });
        console.log("no user found");
        return;
    }
    try {
        yield recivetransaction(user.privatekey, decoded);
    }
    catch (e) {
        console.log("failed");
        return res.json({ message: "Transaction failed", e });
    }
    try {
        yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            let ch = false;
            for (let i = 0; i < (challenge === null || challenge === void 0 ? void 0 : challenge.members.length); i++) {
                if (challenge.members[i] == user.id) {
                    ch = true;
                }
            }
            if (ch) {
                console.log("check");
                return res.json({ message: "User already exist" });
            }
            const updatechallenge = yield prisma.challenge.update({
                where: {
                    id
                }, data: {
                    members: {
                        push: user.id
                    },
                    Totalamount: challenge.Totalamount + challenge.Amount
                }
            });
            console.log("challenge", updatechallenge);
            return res.json({ message: "Added to the contest", updatechallenge });
        }));
    }
    catch (error) {
        if (!privatekey) {
            console.log("nO private key foun");
            return;
        }
        console.log(privatekey);
        const transaction = yield revertback(privatekey, decoded.signatures[0].publicKey.toBase58());
        return transaction;
    }
}));
router.get("total/steps", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findMany({
        include: {
            step: true
        }
    });
    return res.status(200).json({ user });
}));
router.post("/regular/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { steps, userid } = req.body;
    if (!steps || !userid) {
        return res.status(500).json({ message: "No steps or userid found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid
        }, include: {
            challenge: true
        }
    });
    if (!user) {
        return res.status(500).json({ message: "No user found" });
    }
    yield prisma.steps.update({
        where: {
            id: user.id
        },
        data: {
            steps: steps,
            day: new Date().toISOString()
        }
    });
    return res.status(200).json({ message: "Succesfully updated the user" });
}));
router.post("/challenge/finish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const privatekey = process.env.PRIVATE_KEY;
    if (!privatekey) {
        res.json({ message: "No private key found" }, { status: 400 });
        return;
    }
    const challengee = yield prisma.challenge.findUnique({
        where: {
            id
        }
    });
    if (!challengee) {
        res.json({ message: "No challenge found" });
        return;
    }
    const equalamount = (challengee === null || challengee === void 0 ? void 0 : challengee.members.length) / (challengee === null || challengee === void 0 ? void 0 : challengee.Totalamount);
    yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < (challengee === null || challengee === void 0 ? void 0 : challengee.members.length); i++) {
            const user = yield prisma.user.findUnique({
                where: {
                    id: challengee === null || challengee === void 0 ? void 0 : challengee.members[i]
                }
            });
            if (!user) {
                res.json({ message: "No user found" });
                return;
            }
            if (!(challengee === null || challengee === void 0 ? void 0 : challengee.Totalamount)) {
                return;
            }
            const send = yield sendtrasaction(privatekey, user.publickey, equalamount);
            yield prisma.challenge.update({
                where: {
                    id
                },
                data: {
                    Totalamount: challengee.Totalamount - equalamount
                }
            });
            // console.log(send); 
        }
    }));
    return res.status(200).json({ message: "contest Ended Succefully" });
}));
router.post("/challenge/private", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, Amount, Digital_Currency, days, Dailystep, memberqty, name, members } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    if (!user) {
        res.json({ message: "No user found for paticular id" });
    }
    yield prisma.challenge.create({
        data: {
            userid: userid,
            Amount,
            Digital_Currency,
            Dailystep,
            days,
            memberqty,
            Totalamount: 0,
            type: "private",
            members: [],
            name,
            Request: members,
            PayoutStatus: "false"
        }
    });
    return res.json({ message: "Challenge created succefull" });
}));
router.post("/challenge/acceptchallenge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chaalengeid, userid, username, tx } = req.body;
    const decoded = web3_js_1.Transaction.from(tx);
    if (!chaalengeid || !userid || !username) {
        res.json({ message: "No challenge or userid username found" });
    }
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id: chaalengeid
        }
    });
    const user = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (!user) {
        return res.json({ message: "No user find" });
    }
    if (!chaalengeid) {
        res.json({ message: "No challenge found for pricular that particular id" });
        return;
    }
    if (!(challenge === null || challenge === void 0 ? void 0 : challenge.Request[username])) {
        res.json({ message: "You were not added to the Challenge Kindly ask the user to add you to challenge" });
        return;
    }
    yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const txs = yield recivetransaction(user.privatekey, decoded);
        if (!txs) {
            return res.json({ message: "Transactio failed" });
        }
        yield prisma.challenge.update({
            where: {
                id: chaalengeid
            }, data: {
                Request: {
                    set: challenge.Request.filter((user) => user !== username)
                },
                members: {
                    push: user.username
                }
            }
        });
    }));
    return res.status(200).json({ message: "User added succe" });
}));
router.post("/challenge/private/finish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const privatekey = process.env.PRIVATE_KEY;
    if (!privatekey) {
        res.json({ message: "No private key found" });
        return;
    }
    try {
        const challengee = yield prisma.challenge.findUnique({
            where: {
                id
            }
        });
        if (!challengee) {
            res.json({ message: "No challenge found" });
            return;
        }
        const equalamount = (challengee === null || challengee === void 0 ? void 0 : challengee.members.length) / (challengee === null || challengee === void 0 ? void 0 : challengee.Totalamount);
        yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 0; i < (challengee === null || challengee === void 0 ? void 0 : challengee.members.length); i++) {
                const user = yield prisma.user.findUnique({
                    where: {
                        id: challengee === null || challengee === void 0 ? void 0 : challengee.members[i]
                    }
                });
                if (!user) {
                    res.json({ message: "No user found" });
                    return;
                }
                if (!(challengee === null || challengee === void 0 ? void 0 : challengee.Totalamount)) {
                    return;
                }
                const send = yield sendtrasaction(privatekey, user.publickey, equalamount);
                if (send) {
                    challengee.Totalamount -= challengee === null || challengee === void 0 ? void 0 : challengee.Amount;
                }
                yield prisma.challenge.update({
                    where: {
                        id
                    }, data: {
                        Totalamount: challengee.Totalamount - equalamount
                    }
                });
                console.log(send);
            }
        }));
        return res.json({ message: "contest Ended Succefully" });
    }
    catch (e) {
        console.error("Error during payout:", e);
        return res.status(500).json({ message: "Failed to complete payout", error: e.message });
    }
}));
function sendtrasaction(privatekey, publicKey, Amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(privatekey);
        const keypair = web3_js_1.Keypair.fromSecretKey(encoded);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new web3_js_1.PublicKey(publicKey),
            lamports: Amount * web3_js_1.LAMPORTS_PER_SOL
        }));
        const send = yield connection.sendTransaction(transaction, [keypair]);
        console.log(send);
        return send;
    });
}
function revertback(privatekey, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const decodedKey = bs58_1.default.decode(privatekey);
        console.log(decodedKey);
        const secretkey = web3_js_1.Keypair.fromSecretKey(decodedKey);
        console.log("secrret", secretkey);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: secretkey.publicKey,
            toPubkey: new web3_js_1.PublicKey(publicKey),
            lamports: web3_js_1.LAMPORTS_PER_SOL
        }));
        const sendtransaction = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [secretkey]);
        return sendtransaction;
    });
}
function recivetransaction(privatekey, decoded) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKeyArray = privatekey.split(',').map(num => parseInt(num, 10));
        const uintprivat = new Uint8Array(privateKeyArray);
        const secretkey = web3_js_1.Keypair.fromSecretKey(uintprivat);
        const sendtrasaction = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, decoded, [secretkey]);
        console.log(sendtrasaction);
        return sendtrasaction;
    });
}
exports.challenges = router;
