import express from "express";
import { userrouter } from "./Auth/auth";
import cors from "cors";
import { challenges } from "./Challenge/tournament";
import { Friend } from "./Auth/friend";
import axios from "axios";
import { sleeprouter } from "./Challenge/sleep";
import { Gettime } from "./worker/Step";
import { stakerouter } from "./Challenge/Stake";
import dotenv from "dotenv"
import { getstake } from "./worker/stake";
import { Getsleep } from "./worker/sleep";
import { StakeCronrouter } from "./Challenge/worker";
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
app.use("/api/v1", userrouter);
app.use("/api/v1", challenges);
app.use("/api/v1", sleeprouter);
app.use("/api/v1", Friend);
app.use("/api/v1", stakerouter);
app.use("/api/v1",StakeCronrouter);
app.get("/test", async (req: any, res: any) => {
  console.log("ewe");
  const trydd = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  return res.json({ sol: trydd.data.solana.usd });
});

Gettime();
getstake();
Getsleep();
const port =process.env.PORT;
console.log(port);
app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
