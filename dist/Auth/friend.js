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
exports.Friend = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/add/friend", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userid } = req.body;
    if (!username || !userid) {
        return res.status(400).json({ message: "No username or userid found" });
    }
    const users = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    if (!users) {
        return res.status(500).json({ message: "No user found for this particular id" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (!user) {
        res.json({ message: "No user found" });
    }
    console.log("HCke");
    yield prisma.user.update({
        where: {
            username: username
        }, data: {
            Request: {
                push: users === null || users === void 0 ? void 0 : users.username
            }
        }
    });
    yield prisma.user.update({
        where: {
            id: userid
        }, data: {
            Notification: { push: `Friend request from ${user === null || user === void 0 ? void 0 : user.username}` }
        }
    });
    return res.status(200).json({ message: "Requested send to you friend" });
}));
router.get("/friend/request/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return res.json({ message: "No id found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        return res.json({ message: "No user found" });
    }
    return res.json({ message: user.Request });
}));
router.get("/get/friends/:userid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userid;
    if (!userid) {
        return res.json({ message: "No user id found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    return res.json({ user: user === null || user === void 0 ? void 0 : user.Friends });
}));
router.post("/tews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.challenge.update({
        where: {
            id: "28872c8e-56e8-4e3e-ba29-03174444db19"
        }, data: {
            Payoutpeople: {
                push: "a2fa595c-b063-4c36-ad03-c3fbb284309a"
            }
        }
    });
    return res.json({ message: "pushed succesfully" });
}));
router.post("/test/step", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { step } = req.body;
    const daten = new Date().toISOString();
    console.log("checke");
    yield prisma.steps.create({
        data: {
            userid: "9e699d39-09f1-47b8-96e8-6004a3c8eb1e",
            steps: step,
            day: daten
        }
    });
    return res.json({ message: "send succesfully" });
}));
router.get("/test/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.json({ message: "Checkeddd " });
}));
router.post("/accept/friend", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, username, bool } = req.body;
    if (!userid || !username) {
        return res.status(400).json({ message: "No userid found" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            id: userid,
        }
    });
    if (!user) {
        return res.status(440).json({ message: "No user found for that particular id" });
    }
    const friend = user === null || user === void 0 ? void 0 : user.Request.map((frin) => frin == username);
    if (!friend) {
        return res.status(400).json({ message: "No user found for that paricular id" });
    }
    if (bool) {
        yield prisma.user.update({
            where: {
                id: userid,
            }, data: {
                Friends: {
                    push: username
                }
            }
        });
        yield prisma.user.update({
            where: {
                id: userid,
            }, data: {
                Request: {
                    set: user.Request.filter(el => el !== username)
                }
            }
        });
        return res.status(200).json({ message: "Friend is added your list" });
    }
    else {
        yield prisma.user.update({
            where: {
                id: userid,
            }, data: {
                Request: {
                    set: user.Request.filter(el => el !== username)
                }
            }
        });
        return res.status(200).json({ message: "User removed from you list" });
    }
}));
exports.Friend = router;
