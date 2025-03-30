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
    const requestuser = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    if (!requestuser) {
        return res.status(500).json({ message: "No user found for this particular id" });
    }
    const user = yield prisma.user.findUnique({
        where: {
            username
        }
    });
    if (!user) {
        return res.json({ message: "No user found" });
    }
    prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.user.update({
            where: {
                username: username
            }, data: {
                Request: {
                    push: requestuser === null || requestuser === void 0 ? void 0 : requestuser.username
                }
            }
        });
        yield prisma.user.update({
            where: {
                id: userid
            }, data: {
                RequestFriend: {
                    push: user === null || user === void 0 ? void 0 : user.username
                }
            }
        });
        return res.status(200).json({ message: "Requested send to you friend" });
    }));
    //    return res.status(500).json({message:"Failed"});
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
router.get("/alredy/frien/:userdid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.userdid;
    if (!userid) {
        return res.status(500).json({ message: "No user found for this id" });
    }
    const users = yield prisma.user.findUnique({
        where: {
            id: userid
        }
    });
    return res.status(200).json({ username: users === null || users === void 0 ? void 0 : users.RequestFriend });
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
router.post("/step/analysis", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const userTimezone = req.body.timezone || 'UTC';
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 6);
        const formatDateToStorageFormat = (date) => {
            return date.toISOString().split('T')[0];
        };
        const stepData = yield prisma.steps.findMany({
            where: {
                userid: id,
                day: {
                    gte: formatDateToStorageFormat(lastWeek),
                    lte: formatDateToStorageFormat(today)
                }
            },
            orderBy: {
                day: 'asc'
            }
        });
        const stepsMap = new Map();
        stepData.forEach(entry => {
            const dateKey = typeof entry.day === 'string' ?
                entry.day.split('T')[0] :
                new Date(entry.day).toISOString().split('T')[0];
            stepsMap.set(dateKey, entry.steps);
        });
        // Generate complete 7-day response
        const completeStepData = [];
        const currentDate = new Date(lastWeek);
        while (currentDate <= today) {
            const dateStr = formatDateToStorageFormat(currentDate);
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            completeStepData.push({
                date: dateStr,
                day: dayNames[currentDate.getDay()],
                steps: stepsMap.get(dateStr) || 0, // Default to 0 if no entry
                // Include other relevant fields from your schema
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        res.status(200).json({
            message: "Step analysis completed successfully",
            analysisPeriod: {
                start: formatDateToStorageFormat(lastWeek),
                end: formatDateToStorageFormat(today),
                days: completeStepData.length
            },
            data: completeStepData
        });
    }
    catch (error) {
        console.error("Step analysis error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
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
        const users = yield prisma.user.update({
            where: {
                id: userid,
            }, data: {
                Friends: {
                    push: username
                },
                Request: {
                    set: user.Request.filter(el => el !== username)
                }
            }
        });
        yield prisma.user.update({
            where: {
                id: userid
            }, data: {
                Friends: {
                    push: username
                },
                RequestFriend: {
                    set: user.Request.filter(el => el !== username)
                }
            }
        });
        yield prisma.user.update({
            where: {
                username: username
            }, data: {
                RequestFriend: {
                    set: user.RequestFriend.filter(el => el !== users.username)
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
