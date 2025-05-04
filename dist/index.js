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
const axios_1 = __importDefault(require("axios"));
const sleep_1 = require("./Challenge/sleep");
const Stake_1 = require("./Challenge/Stake");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", auth_1.userrouter);
app.use("/api/v1", tournament_1.challenges);
app.use("/api/v1", sleep_1.sleeprouter);
app.use("/api/v1", friend_1.Friend);
app.use("/api/v1", Stake_1.stakerouter);
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trydd = yield axios_1.default.get("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    return res.json({ sol: trydd.data.solana.usd });
}));
// Gettime();
// getstake();
// Getsleep();
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening at ${port}`);
});
