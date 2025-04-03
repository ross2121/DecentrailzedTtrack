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
const express_1 = __importDefault(require("express"));
const auth_1 = require("./Auth/auth");
const cors_1 = __importDefault(require("cors"));
const tournament_1 = require("./Challenge/tournament");
const friend_1 = require("./Auth/friend");
const client_1 = require("@prisma/client");
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", auth_1.userrouter);
app.use("/api/v1", tournament_1.challenges);
app.use("/api/v1", friend_1.Friend);
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trydd = yield axios_1.default.get("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    console.log(trydd.data);
    return res.json({ sol: trydd.data.solana.usd });
}));
app.get("/tes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.json({ message: "youval" });
}));
function Gettime() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("checekdsds");
        const cronSchedule = `0 0 * * *`;
        node_cron_1.default.schedule(cronSchedule, () => __awaiter(this, void 0, void 0, function* () {
            const enddatespublic = yield prisma.challenge.findMany({});
            console.log("chek1");
            for (const member of enddatespublic) {
                console.log(member.PayoutStatus);
                console.log(member);
                if (member.PayoutStatus == "payoutsucess" || member.PayoutStatus == "completed") {
                    console.log("checke1");
                    continue;
                }
                const date = new Date(member.enddate);
                date.setDate(date.getDate());
                date.setHours(0, 0, 0, 0);
                if (member.status === "CurrentlyRunning" && new Date(member.enddate) < date) {
                    yield prisma.challenge.update({
                        where: {
                            id: member.id,
                        },
                        data: {
                            status: "Completed",
                        },
                    });
                }
                try {
                    if (member.status === "Completed") {
                        if (member.PayoutStatus === "pending") {
                            const publicmember = member.members;
                            for (const user of publicmember) {
                                const response = yield axios_1.default.post("http://localhost:3000/api/v1/step/verification", {
                                    startdate: member.startdate,
                                    enddate: member.enddate,
                                    userid: user,
                                    challengeid: member.id,
                                });
                                console.log(response.data);
                            }
                            const response = yield axios_1.default.post("http://localhost:3000/api/v1/challenge/finish", { id: member.id });
                            console.log(response.data);
                            const payoutmap = yield prisma.payoutPerson.findMany({
                                where: {
                                    challengeId: member.id,
                                },
                            });
                            const remainig = yield prisma.remainingPerson.findMany({
                                where: {
                                    challengeId: member.id,
                                },
                            });
                            if (payoutmap.length === 0 && remainig.length === 0) {
                                yield prisma.challenge.update({
                                    where: {
                                        id: member.id,
                                    },
                                    data: {
                                        PayoutStatus: "completed",
                                    },
                                });
                            }
                            else {
                                yield prisma.challenge.update({
                                    where: {
                                        id: member.id,
                                    },
                                    data: {
                                        PayoutStatus: "payoutsucess",
                                    },
                                });
                            }
                            //    break;
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }));
    });
}
Gettime();
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening at ${port}`);
});
