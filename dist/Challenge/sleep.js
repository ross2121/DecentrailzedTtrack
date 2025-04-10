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
exports.sleeprouter = router;
