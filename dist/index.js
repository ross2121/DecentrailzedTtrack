"use strict";
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
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", auth_1.userrouter);
app.use("/api/v1", tournament_1.challenges);
app.use("/api/v1", friend_1.Friend);
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening at ${port}`);
});
