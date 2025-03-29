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
const crypto_1 = __importDefault(require("crypto"));
const web3_js_1 = require("@solana/web3.js");
const prisma = new client_1.PrismaClient();
const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
const router = (0, express_1.Router)();
dotenv_1.default.config();
const privatekey = process.env.PRIVATE_KEY;
const algorithm = 'aes-256-cbc';
const key = crypto_1.default.scryptSync(process.env.CRYPTO_SECRET || 'your-secret', 'salt', 32);
router.post("/create/challenge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberqty, Dailystep, Amount, Digital_Currency, days, userid, startdate, enddate } = req.body;
    const verify = type_1.challenge.safeParse({ name, memberqty, Dailystep, Amount, Digital_Currency, days });
    if (!verify.success) {
        return res.status(400).json({ error: verify.error.errors });
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
                PayoutStatus: "pending",
                startdate,
                enddate
            }
        });
        yield prisma.user.update({
            where: {
                id: userid
            }, data: {
                HistoryCreated: {
                    push: challenge.id
                }
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
router.post("/step/verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startdate, enddate, userid, challengeid } = req.body;
    if (!startdate || !enddate || !userid || !challengeid) {
        return res.status(440).json("Required fields ");
    }
    const user = yield prisma.steps.findMany({
        where: {
            userid: userid,
        }
    });
    const challeng = yield prisma.challenge.findUnique({
        where: {
            id: challengeid
        }
    });
    if (!challeng) {
        return res.status(400).json({ message: "No challenge found for that particular id" });
    }
    const Stepmap = {};
    user.map((users) => {
        Stepmap[users.day] = parseInt(users.steps);
    });
    console.log(Stepmap);
    let date = new Date(startdate);
    let confirm = true;
    let i = 0;
    while (i < challeng.days) {
        console.log(Stepmap[date.toISOString().split('T')[0]]);
        if (Stepmap[date.toISOString().split('T')[0]] < challeng.Dailystep) {
            confirm = false;
            console.log("check");
            break;
        }
        date.setDate(date.getDate() + 1);
        i++;
    }
    if (confirm) {
        console.log(confirm);
        yield prisma.payoutPerson.create({
            data: {
                userId: userid,
                challengeId: challeng.id
            }
        });
        return res.status(200).json({ message: "USer successfully completed to the contest" });
    }
    return res.json({ message: "User  fail to complete the test" });
}));
router.get("/challenge/private/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    console.log(userid);
    const allchalange = yield prisma.challenge.findMany({
        where: {
            Request: {
                has: userid
            },
            type: "private"
        }
    });
    return res.status(200).json({ allchalange });
}));
router.get("/history/prevgame/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const useid = req.params.userid;
    const tournatment = yield prisma.challenge.findMany({
        where: {
            userid: useid
        }
    });
    return res.status(200).json({ Tournament: tournatment });
}));
router.get("/history/prev/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const useid = req.params.userid;
    const tournatment = yield prisma.challenge.findMany({
        where: {
            members: {
                has: useid
            }
        }
    });
    return res.status(200).json({ Tournament: tournatment });
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
router.post("/send/wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tx } = req.body;
    const transaction = web3_js_1.Transaction.from(tx.data);
    console.log(transaction);
    const user = yield prisma.user.findFirst({
        where: {
            publickey: transaction.signatures[0].publicKey.toBase58()
        }
    });
    console.log("check1");
    console.log("publickey", user === null || user === void 0 ? void 0 : user.publickey);
    if (!user) {
        res.json({ message: "No user found" });
        console.log("no user found");
        return;
    }
    // const bufferfrom=Buffer.from(user.iv,'hex')
    // @ts-ignore
    const iv = Buffer.from(user.iv, 'hex');
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);
    try {
        yield recivetransaction(decrypted, transaction);
        return res.status(200).json({ message: "Transaction Successfull" });
    }
    catch (e) {
        console.log("failed");
        return res.status(400).json({ message: "Transaction failed", e });
    }
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
    const tx = req.body.tx;
    const decoded = web3_js_1.Transaction.from(tx.data);
    console.log("decoded", decoded);
    const user = yield prisma.user.findFirst({
        where: {
            publickey: decoded.signatures[0].publicKey.toBase58()
        }
    });
    for (let i = 0; i < challenge.members.length; i++) {
        if (challenge.members[i] == (user === null || user === void 0 ? void 0 : user.id)) {
            return res.status(440).json({ message: "User alredy exist" });
        }
    }
    if ((challenge === null || challenge === void 0 ? void 0 : challenge.members.length) >= (challenge === null || challenge === void 0 ? void 0 : challenge.memberqty)) {
        return res.status(440).json({ message: "Challenge is full" });
    }
    console.log("publickey", user === null || user === void 0 ? void 0 : user.publickey);
    if (!user) {
        res.json({ message: "No user found" });
        console.log("no user found");
        return;
    }
    // @ts-ignore
    const iv = Buffer.from(user.iv, 'hex');
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const userprev = yield prisma.challenge.findUnique({
        where: {
            id: challenge.id,
            members: {
                has: user.id
            }
        }
    });
    if (userprev) {
        return res.status(500).json({ message: "USer alredy added in the contest" });
    }
    try {
        yield recivetransaction(decrypted, decoded);
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
        const transaction = yield revertback(privatekey, decoded.signatures[0].publicKey.toBase58(), challenge.Amount);
        return transaction;
    }
}));
router.get("/total/steps", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offset);
    const todayStr = istTime.toISOString().split('T')[0];
    const users = yield prisma.user.findMany({
        include: {
            step: {
                where: {
                    day: todayStr
                },
            },
        },
    });
    const formattedSteps = users.map(user => {
        var _a;
        return ({
            username: user.username,
            steps: ((_a = user.step[0]) === null || _a === void 0 ? void 0 : _a.steps) || 0,
        });
    });
    return res.status(200).json({ data: formattedSteps });
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
    const now = new Date();
    const offsetIST = 330;
    const todayIST = new Date(now.getTime() + offsetIST * 60 * 1000).toISOString().split('T')[0];
    if (!user) {
        return res.status(500).json({ message: "No user found" });
    }
    const existing = yield prisma.steps.findFirst({
        where: {
            userid: user.id,
            day: todayIST,
        },
    });
    if (existing) {
        yield prisma.steps.update({
            where: {
                id: existing.id,
            },
            data: {
                steps: steps,
            },
        });
    }
    else {
        yield prisma.steps.create({
            data: {
                userid: user.id,
                steps: steps,
                day: todayIST,
            },
        });
    }
    return res.status(200).json({ message: "Successfully updated the user" });
}));
router.post("/challenge/finish", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const privatekey = process.env.PRIVATE_KEY;
    if (!privatekey) {
        return res.status(400).json({ message: "No private key found" });
    }
    const challengee = yield prisma.challenge.findUnique({
        where: { id },
        include: {
            Payoutpeople: true,
            Remaingpeople: true
        }
    });
    if (!challengee) {
        return res.status(400).json({ message: "No challenge found" });
    }
    const equalamount = Number(challengee.Totalamount / challengee.members.length);
    console.log(equalamount);
    console.log("length", challengee.Payoutpeople.length);
    for (let i = 0; i < challengee.Payoutpeople.length; i++) {
        const user = yield prisma.user.findUnique({
            where: {
                id: challengee.Payoutpeople[i].userId
            }
        });
        if (!user) {
            return res.status(500).json({ message: "No user found" });
        }
        try {
            const transaction = yield sendtrasaction(privatekey, user.publickey, equalamount);
            console.log(i);
            yield prisma.payoutPerson.delete({
                where: {
                    challengeId_userId: {
                        challengeId: challengee.id,
                        userId: user.id
                    }
                }
            });
            if (transaction) {
                yield prisma.challenge.update({
                    where: { id },
                    data: {
                        Totalamount: challengee.Totalamount - equalamount,
                    },
                });
            }
            else {
                yield prisma.remainingPerson.create({
                    data: {
                        userId: user.id,
                        challengeId: challengee.id
                    },
                });
            }
        }
        catch (e) {
            console.log(e);
            prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                yield prisma.payoutPerson.delete({
                    where: {
                        challengeId_userId: {
                            userId: user.id,
                            challengeId: challengee.id
                        }
                    }
                });
                yield prisma.remainingPerson.create({
                    data: {
                        userId: user.id,
                        challengeId: challengee.id
                    }
                });
            }));
        }
    }
    return res.status(200).json({ message: "contest Ended Successfully" });
}));
router.post("/challenge/private", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, Amount, Digital_Currency, days, Dailystep, memberqty, name, request, startdate, enddate } = req.body;
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
            Request: request,
            PayoutStatus: "pending",
            startdate,
            enddate
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
    if (!challenge) {
        res.json({ message: "No challenge found for pricular that particular id" });
        return;
    }
    for (let i = 0; i < (challenge === null || challenge === void 0 ? void 0 : challenge.members.length); i++) {
        if (challenge.members[i] == user.id) {
            return res.status(400).json("User alredy exist in tournament");
        }
    }
    if (!(challenge === null || challenge === void 0 ? void 0 : challenge.Request[username])) {
        res.json({ message: "You were not added to the Challenge Kindly ask the user to add you to challenge" });
        return;
    }
    yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        const iv = Buffer.from(user.iv, 'hex');
        const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(user.privatekey, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const txs = yield recivetransaction(decrypted, decoded);
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
function sendtrasaction(privatekey, publicKey, Amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decodedKey = bs58_1.default.decode(privatekey);
            const keypair = web3_js_1.Keypair.fromSecretKey(decodedKey);
            console.log("chekad");
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new web3_js_1.PublicKey(publicKey),
                lamports: Math.floor(web3_js_1.LAMPORTS_PER_SOL * Amount)
            }));
            const send = yield connection.sendTransaction(transaction, [keypair]);
            console.log(send);
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    });
}
function revertback(privatekey, publicKey, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const decodedKey = bs58_1.default.decode(privatekey);
        console.log(decodedKey);
        const secretkey = web3_js_1.Keypair.fromSecretKey(decodedKey);
        console.log("secrret", secretkey);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: secretkey.publicKey,
            toPubkey: new web3_js_1.PublicKey(publicKey),
            lamports: Math.floor(web3_js_1.LAMPORTS_PER_SOL * amount)
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
