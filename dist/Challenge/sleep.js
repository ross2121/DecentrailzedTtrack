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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleeprouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const type_1 = require("../Auth/type");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/regular/update/sleep", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hours, userid } = req.body;
    if (!hours || !userid) {
        return res.status(500).json({ message: "No hours or userid found" });
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
    const existing = yield prisma.sleep.findFirst({
        where: {
            userid: user.id,
            day: todayIST,
        },
    });
    if (existing) {
        yield prisma.sleep.update({
            where: {
                id: existing.id,
            },
            data: {
                Hours: hours
            },
        });
    }
    else {
        yield prisma.sleep.create({
            data: {
                userid: user.id,
                Hours: hours,
                day: todayIST,
            },
        });
    }
    return res.status(200).json({ message: "Successfully updated the user" });
}));
router.post("/create/challenge/sleep", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberqty, Hours, Amount, Digital_Currency, days, userid, startdate, enddate } = req.body;
    const verify = type_1.sleepchallenge.safeParse({ name, memberqty, Hours, Amount, Digital_Currency, days });
    if (!verify.success) {
        return res.status(400).json({ error: verify.error.errors });
    }
    try {
        const challenge = yield prisma.challenge.create({
            data: {
                name,
                members: [],
                memberqty,
                Hours,
                Totalamount: 0,
                types: "Sleep",
                Amount,
                Digital_Currency,
                days,
                userid,
                PayoutStatus: "pending",
                startdate,
                enddate,
                // Request:[]
            }
        });
        return res.status(201).json({ message: "Challenge Created Successfully", challenge });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
    }
}));
router.post("/challenge/sleep/private", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberqty, Hours, Amount, Digital_Currency, days, userid, startdate, enddate, request } = req.body;
    const verify = type_1.sleepchallenge.safeParse({ name, memberqty, Hours, Amount, Digital_Currency, days });
    console.log("dasdas", request);
    if (!verify.success) {
        return res.status(400).json({ error: verify.error.errors });
    }
    if (request.length + 1 !== memberqty) {
        return res.status(400).json({ error: "Select more friends to continue" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    if (user == null) {
        return;
    }
    const updatedRequest = [user.username, ...(request || [])];
    console.log("dasd", updatedRequest);
    try {
        const challenge = yield prisma.challenge.create({
            data: {
                name,
                members: [],
                memberqty,
                Hours,
                Totalamount: 0,
                types: "Sleep",
                Amount,
                Digital_Currency,
                days,
                userid,
                PayoutStatus: "pending",
                startdate,
                type: "private",
                enddate,
                Request: updatedRequest
            }
        });
        return res.status(201).json({ message: "Challenge Created Successfully", challenge });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating Challenge", error });
    }
}));
router.get("/sleep/daily/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userid;
    if (!id) {
        return res.status(500).json({ message: "No id found" });
    }
    const user = yield prisma.sleep.findMany({
        where: {
            userid: id
        }
    });
    return res.status(200).json({ user });
}));
router.post("/sleep/verification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startdate, enddate, userid, challengeid } = req.body;
    if (!startdate || !enddate || !userid || !challengeid) {
        return res.status(440).json("Required fields ");
    }
    const user = yield prisma.sleep.findMany({
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
    const Sleepmap = {};
    user.map((users) => {
        Sleepmap[users.day] = users.Hours || "0h 0m";
    });
    console.log(Sleepmap);
    let date = new Date(startdate);
    let confirm = true;
    let i = 0;
    if (challeng.Hours == null) {
        return res.status(400).json({ message: "Error" });
    }
    const challengehour = parseDuration(challeng.Hours);
    while (i < challeng.days) {
        console.log(Sleepmap[date.toISOString().split('T')[0]]);
        const dayhour = parseDuration(Sleepmap[date.toISOString().split('T')[0]]);
        if (dayhour < challengehour) {
            confirm = false;
            break;
        }
        console.log(dayhour);
        console.log(challengehour);
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
router.get("/total/sleep", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offset);
    const todayStr = istTime.toISOString().split('T')[0];
    const users = yield prisma.user.findMany({
        include: {
            Sleep: {
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
            steps: ((_a = user.Sleep[0]) === null || _a === void 0 ? void 0 : _a.Hours) || 0,
        });
    });
    return res.status(200).json({ data: formattedSteps });
}));
function parseDuration(duration) {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
}
exports.sleeprouter = router;
