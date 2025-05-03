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
const algorithm = "aes-256-cbc";
const key = crypto_1.default.scryptSync(process.env.CRYPTO_SECRET || "your-secret", "salt", 32);
router.post("/create/challenge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberqty, Dailystep, Amount, Digital_Currency, days, userid, startdate, enddate, } = req.body;
    const verify = type_1.challenge.safeParse({
        name,
        memberqty,
        Dailystep,
        Amount,
        Digital_Currency,
        days,
    });
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
                types: "Steps",
                Amount,
                Digital_Currency,
                days,
                userid,
                PayoutStatus: "pending",
                startdate,
                enddate,
                // Request:[]
            },
        });
        return res
            .status(201)
            .json({ message: "Challenge Created Successfully", challenge });
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
            id: id,
        },
    });
    if (!challenge) {
        return res
            .status(400)
            .json({ message: "No challenge found for a particular id" });
    }
    return res.status(200).json({ challenge });
}));
router.get("/challenge/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allchalange = yield prisma.challenge.findMany({
        where: {
            type: "public",
        },
    });
    return res.status(200).json({ allchalange });
}));
router.post("/step/verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, challengeid } = req.body;
    if (!userid || !challengeid) {
        return res.status(440).json("Required fields ");
    }
    const user = yield prisma.steps.findMany({
        where: {
            userid: userid,
        },
    });
    const challeng = yield prisma.challenge.findUnique({
        where: {
            id: challengeid,
        },
    });
    if (!challeng) {
        return res
            .status(400)
            .json({ message: "No challenge found for that particular id" });
    }
    const Stepmap = {};
    user.map((users) => {
        Stepmap[users.day] = parseInt(users.steps);
    });
    console.log(Stepmap);
    let date = new Date(challeng.startdate);
    let confirm = true;
    let i = 0;
    if (challeng.Dailystep == null) {
        return res.status(400).json({ message: "Daily step not found" });
    }
    console.log(i);
    console.log(challeng.days);
    while (i < challeng.days) {
        console.log("chee");
        console.log(Stepmap[date.toISOString().split("T")[0]]);
        if (Stepmap[date.toISOString().split("T")[0]] < challeng.Dailystep ||
            !Stepmap[date.toISOString().split("T")[0]]) {
            console.log("check 3");
            console.log(date.toISOString().split("T")[0]);
            confirm = false;
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
                challengeId: challeng.id,
            },
        });
        return res
            .status(200)
            .json({ message: "USer successfully completed to the contest" });
    }
    return res.json({ message: "User  fail to complete the test" });
}));
router.get("/challenge/private/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const userid = yield prisma.user.findUnique({
        where: {
            username: username,
        },
    });
    if (!userid) {
        return res
            .status(400)
            .json({ message: "NO user id found for particular id" });
    }
    const allchalange = yield prisma.challenge.findMany({
        where: {
            OR: [
                {
                    Request: {
                        has: userid.username,
                    },
                },
                {
                    members: {
                        has: userid.id,
                    },
                },
            ],
            type: "private",
        },
    });
    return res.status(200).json({ allchalange });
}));
router.get("/history/prevgame/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const useid = req.params.userid;
    const tournatment = yield prisma.challenge.findMany({
        where: {
            userid: useid,
        },
    });
    return res.status(200).json({ Tournament: tournatment });
}));
router.get("/history/prev/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const useid = req.params.userid;
    const tournatment = yield prisma.challenge.findMany({
        where: {
            members: {
                has: useid,
            },
        },
    });
    return res.status(200).json({ Tournament: tournatment });
}));
router.post("/challenge/retry", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { challengeid } = req.body;
    if (!challengeid) {
        return res.status(400).json({ message: "No challenge id found" });
    }
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id: challengeid,
        },
    });
    if (!challenge) {
        return res.status(400).json({ message: "Challenge not found" });
    }
    const userr = yield prisma.remainingPerson.findMany({
        where: {
            challengeId: challengeid,
        },
    });
    if (!userr) {
        return res.status(440).json({ message: "No user found" });
    }
    if (!privatekey) {
        return res.status(440).json({ message: "Private key not found" });
    }
    const amount = Number(challenge.Totalamount / userr.length);
    for (let i = 0; i < userr.length; i++) {
        try {
            const userid = userr[i].userId;
            const user = yield prisma.user.findUnique({
                where: {
                    id: userid,
                },
            });
            if (!user) {
                return res.json({ message: "no user found" });
            }
            const publicKey = user.publickey;
            const transaction = yield sendtrasaction(privatekey, publicKey, amount);
            if (transaction) {
                yield prisma.remainingPerson.delete({
                    where: {
                        challengeId_userId: {
                            challengeId: challenge.id,
                            userId: user.id,
                        },
                    },
                });
                yield prisma.challenge.update({
                    where: {
                        id: challenge.id,
                    },
                    data: {
                        Totalamount: challenge.Totalamount - amount,
                    },
                });
            }
            else {
                continue;
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}));
router.get("/challenge/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    if (!userid) {
        return res.status(400).json({ message: "No user id found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid,
        },
        include: {
            challenge: true,
        },
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
            members: userid,
        },
    });
    if (!user) {
        return res.status(400).json({ message: "No user found for paricular id" });
    }
    return res.status(200).json({ message: user });
}));
router.post("/send/wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tx } = req.body;
        const transaction = web3_js_1.Transaction.from(tx.data);
        console.log(transaction);
        const user = yield prisma.user.findFirst({
            where: {
                publickey: transaction.signatures[0].publicKey.toBase58(),
            },
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
        const iv = Buffer.from(user.iv, "hex");
        const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(user.privatekey, "hex", "utf8");
        decrypted += decipher.final("utf8");
        console.log(decrypted);
        const trax = yield recivetransaction(decrypted, transaction);
        if (trax) {
            console.log("check2");
            return res.status(200).json({ message: "Transaction Successfull" });
        }
        else {
            console.log("check33");
            return res.status(440).json({ message: "Transaction Failed" });
        }
    }
    catch (e) {
        console.log("failed");
        console.log("check33");
        return res.status(400).json({ message: "Transaction failed", e });
    }
}));
router.post("/challenge/join/public/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log("id", id);
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id,
        },
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
            publickey: decoded.signatures[0].publicKey.toBase58(),
        },
    });
    console.log(user);
    if (!user) {
        console.log("no user");
        return res.status(400).json({ message: "USer not found" });
    }
    if (challenge.type == "private") {
        const users = yield prisma.challenge.findFirst({
            where: {
                Request: {
                    has: user.username,
                },
            },
        });
        if (!users) {
            return res.status(440).json({ message: "You are not invited" });
        }
    }
    console.log("check11");
    for (let i = 0; i < challenge.members.length; i++) {
        if (challenge.members[i] == (user === null || user === void 0 ? void 0 : user.id)) {
            console.log("check13");
            return res.status(440).json({ message: "User alredy exist" });
        }
    }
    console.log("check14");
    if ((challenge === null || challenge === void 0 ? void 0 : challenge.members.length) >= (challenge === null || challenge === void 0 ? void 0 : challenge.memberqty)) {
        console.log("check15");
        return res.status(440).json({ message: "Challenge is full" });
    }
    console.log("publickey", user === null || user === void 0 ? void 0 : user.publickey);
    if (!user) {
        res.json({ message: "No user found" });
        console.log("no user found");
        return;
    }
    // @ts-ignore
    const iv = Buffer.from(user.iv, "hex");
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(user.privatekey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const userprev = yield prisma.challenge.findUnique({
        where: {
            id: challenge.id,
            members: {
                has: user.id,
            },
        },
    });
    if (userprev) {
        return res
            .status(500)
            .json({ message: "USer alredy added in the contest" });
    }
    let trans = false;
    try {
        trans = yield recivetransaction(decrypted, decoded);
        if (trans == true) {
            console.log("heee");
            console.log(trans);
            const updatechallenge = yield prisma.challenge.update({
                where: {
                    id,
                },
                data: {
                    members: {
                        push: user.id,
                    },
                    Totalamount: challenge.Totalamount + challenge.Amount,
                },
            });
            if (challenge.type == "private") {
                console.log("chek1");
                console.log("heeedsdsdd");
                console.log(trans);
                const users = yield prisma.challenge.findFirst({
                    where: {
                        Request: {
                            has: user.username,
                        },
                    },
                });
                if (!users) {
                    return null;
                }
                const updatedRequest = challenge.Request.filter((usert) => usert !== user.username);
                yield prisma.challenge.update({
                    where: {
                        id: users.id,
                    },
                    data: {
                        Request: {
                            set: updatedRequest,
                        },
                    },
                });
            }
            console.log("challenge", updatechallenge);
            return res
                .status(200)
                .json({ message: "Added to the contest", updatechallenge });
        }
    }
    catch (e) {
        console.log("failed");
        if (!privatekey) {
            console.log("nO private key foun");
            return;
        }
        console.log(privatekey);
        if (trans) {
            const users = yield prisma.challenge.findUnique({
                where: {
                    id: id,
                    members: {
                        has: user.id,
                    },
                },
            });
            console.log(users);
            if (!users) {
                const transaction = yield revertback(privatekey, decoded.signatures[0].publicKey.toBase58(), challenge.Amount);
                return res
                    .status(200)
                    .json({ message: "Transaction succeed Revert back the money", e });
            }
        }
        return res.status(400).json({ message: "TRY AGAIN", e });
        //  return transaction;
    }
}));
router.get("/total/steps", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offset);
    const todayStr = istTime.toISOString().split("T")[0];
    const users = yield prisma.user.findMany({
        include: {
            step: {
                where: {
                    day: todayStr,
                },
            },
        },
    });
    const formattedSteps = users.map((user) => {
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
            id: userid,
        },
        include: {
            challenge: true,
        },
    });
    const now = new Date();
    const offsetIST = 330;
    const todayIST = new Date(now.getTime() + offsetIST * 60 * 1000)
        .toISOString()
        .split("T")[0];
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
    console.log("check2");
    const { id } = req.body;
    const privatekey = process.env.PRIVATE_KEY;
    if (!privatekey) {
        return res.status(400).json({ message: "No private key found" });
    }
    const challengee = yield prisma.challenge.findUnique({
        where: { id },
        include: {
            Payoutpeople: true,
            Remaingpeople: true,
        },
    });
    if (!challengee) {
        return res.status(400).json({ message: "No challenge found" });
    }
    const payoutlength = yield prisma.payoutPerson.findMany({
        where: {
            challengeId: challengee.id,
        },
    });
    const equalamount = Number(challengee.Totalamount / payoutlength.length);
    console.log(equalamount);
    console.log("length", challengee.Payoutpeople.length);
    for (let i = 0; i < challengee.Payoutpeople.length; i++) {
        const user = yield prisma.user.findUnique({
            where: {
                id: challengee.Payoutpeople[i].userId,
            },
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
                        userId: user.id,
                    },
                },
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
                        challengeId: challengee.id,
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
                            challengeId: challengee.id,
                        },
                    },
                });
                yield prisma.remainingPerson.create({
                    data: {
                        userId: user.id,
                        challengeId: challengee.id,
                    },
                });
            }));
        }
    }
    return res.status(200).json({ message: "contest Ended Successfully" });
}));
router.post("/challenge/private", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userid, Amount, Digital_Currency, days, Dailystep, memberqty, name, request, startdate, enddate, } = req.body;
        const verify = type_1.challenge.safeParse({
            name,
            memberqty,
            Dailystep,
            Amount,
            Digital_Currency,
            days,
        });
        if (!verify.success) {
            return res.status(400).json({ error: verify.error.errors });
        }
        const user = yield prisma.user.findUnique({
            where: {
                id: userid,
            },
        });
        if (!user) {
            return res
                .status(440)
                .json({ message: "No user found for paticular id" });
        }
        const updatedRequest = [user.username, ...(request || [])];
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
                types: "Steps",
                members: [],
                name,
                Request: updatedRequest,
                PayoutStatus: "pending",
                startdate,
                enddate,
            },
        });
        return res.json({ message: "Challenge created succefull" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
    }
}));
router.get("/challenge/info/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "No user found" });
    }
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id: id,
        },
    });
    if (!challenge) {
        return res
            .status(400)
            .json({ message: "No challenge found for particular id" });
    }
    const startdate = challenge.startdate;
    const enddate = challenge.enddate;
    const today = new Date().toISOString().split("T")[0];
    const effective = today > enddate ? enddate : today;
    const result = [];
    for (let i = 0; i < challenge.members.length; i++) {
        const user = challenge.members[i];
        console.log("sa");
        const step = yield prisma.steps.findMany({
            where: {
                userid: user,
                day: {
                    gte: startdate,
                    lte: effective,
                },
            },
            select: {
                day: true,
                steps: true,
            },
        });
        const users = yield prisma.user.findUnique({
            where: {
                id: user,
            },
        });
        if (step.length === 0) {
            result.push({
                username: users === null || users === void 0 ? void 0 : users.username,
                steps: 0,
                day: new Date().toISOString().split("T")[0],
            });
        }
        else {
            step.forEach((step) => {
                result.push({
                    username: users === null || users === void 0 ? void 0 : users.username,
                    steps: step.steps,
                    day: step.day,
                });
            });
        }
    }
    return res
        .status(200)
        .json({ result, startdate: startdate, enddate: enddate });
}));
router.post("/challenge/acceptchallenge", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chaalengeid, userid, username, tx } = req.body;
    const decoded = web3_js_1.Transaction.from(tx);
    if (!chaalengeid || !userid || !username) {
        res.json({ message: "No challenge or userid username found" });
    }
    const challenge = yield prisma.challenge.findUnique({
        where: {
            id: chaalengeid,
        },
    });
    const user = yield prisma.user.findUnique({
        where: {
            username,
        },
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
        res.json({
            message: "You were not added to the Challenge Kindly ask the user to add you to challenge",
        });
        return;
    }
    yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        const iv = Buffer.from(user.iv, "hex");
        const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(user.privatekey, "hex", "utf8");
        decrypted += decipher.final("utf8");
        const txs = yield recivetransaction(decrypted, decoded);
        if (!txs) {
            return res.json({ message: "Transactio failed" });
        }
        yield prisma.challenge.update({
            where: {
                id: chaalengeid,
            },
            data: {
                Request: {
                    set: challenge.Request.filter((user) => user !== username),
                },
                members: {
                    push: user.username,
                },
            },
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
                lamports: Math.floor(web3_js_1.LAMPORTS_PER_SOL * Amount),
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
            lamports: Math.floor(web3_js_1.LAMPORTS_PER_SOL * amount),
        }));
        const sendtransaction = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [secretkey]);
        return sendtransaction;
    });
}
function recivetransaction(privatekey, decoded) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const privateKeyArray = privatekey
                .split(",")
                .map((num) => parseInt(num, 10));
            const uintprivat = new Uint8Array(privateKeyArray);
            const secretkey = web3_js_1.Keypair.fromSecretKey(uintprivat);
            const sendtrasaction = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, decoded, [secretkey]);
            // console.log(sendtrasaction);
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    });
}
exports.challenges = router;
