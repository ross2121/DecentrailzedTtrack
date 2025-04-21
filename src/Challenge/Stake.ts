import { Express, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Staketype } from "../Auth/type";
import { Transaction } from "@solana/web3.js";
import crypto from "crypto";
import { recivetransaction } from "./trxn";
const prisma = new PrismaClient();
const router = Router();
const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(
  process.env.CRYPTO_SECRET || "your-secret",
  "salt",
  32
);
router.post("/create/stake", async (req: any, res: any) => {
  console.log("heuu");
  const { userid, amount, Hours, days, Startdate, enddate, tx } = req.body;
  // if (!userid || !amount || !Hours || !days || !Startdate || !enddate) {
  //   console.log("userid", userid);
  //   return res.status(400).json({ message: "please provide all the fields" });
  // }
  const safeparse = Staketype.safeParse({
    amount,
    Hours,
    days,
    Startdate,
    enddate,
  });
  console.log("heuu");
  if (!safeparse.success) {
    console.log("safeparse.error", safeparse.error.format());
    return res.status(400).json({ message: safeparse.error.format() });
  }
  console.log(tx);
  const stakeExist = await prisma.stake.findFirst({
    where: {
      Userid: userid,
    },
  });
  if (stakeExist?.Status == "CurrentlyRunning") {
    console.log("stakeExist", stakeExist);
    return res.status(400).json({ message: "You already have a stake" });
  }

  const decoded = Transaction.from(tx.data);
  console.log("decoded", decoded);
  const user = await prisma.user.findFirst({
    where: {
      publickey: decoded.signatures[0].publicKey.toBase58(),
    },
  });
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  //   @ts-ignore
  const iv = Buffer.from(user.iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(user.privatekey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  let trans = false;
  try {
    trans = await recivetransaction(decrypted, decoded);
    const stake = await prisma.stake.create({
      data: {
        startdate: Startdate,
        enddate: enddate,
        Userid: userid,
        amount: amount,
        Hours: Hours,
        Days: days,
      },
    });
    return res.status(200).json({
      message: "stake created successfully",
      stake,
    });
  } catch (e) {
    if (trans) {
      const stake = await prisma.stake.create({
        data: {
          startdate: Startdate,
          enddate: enddate,
          Userid: userid,
          amount: amount,
          Hours: Hours,
          Days: days,
        },
      });
      return res.status(200).json({
        message: "stake created successfully",
        stake,
      });
    }
  }
  //   return res.status(200).json({ message: "stake created successfully", stake });
});
router.get("/getstake/:userid", async (req: any, res: any) => {
  const { userid } = req.params;
  console.log("amount", parseDuration("8h"));
  if (!userid) {
    return res.status(400).json({ message: "please provide all the fields" });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const stake = await prisma.stake.findMany({
    where: {
      Userid: userid,
    },
  });
  return res.status(200).json({ message: "stake created successfully", stake });
});
router.post("/stake/verification", async (req: any, res: any) => {
  const { Stakeid } = req.body;
  await prisma.stake.update({
    where: {
      id: Stakeid,
    },
    data: {
      Status: "Completed",
    },
  });
  if (!Stakeid) {
    return res.status(440).json("Required fields ");
  }
  const stake = await prisma.stake.findUnique({
    where: {
      id: Stakeid,
    },
  });
  if (!stake) {
    return res
      .status(400)
      .json({ message: "No stake found for that particular id" });
  }
  const Stake = await prisma.stake.findUnique({
    where: {
      id: Stakeid,
    },
  });
  if (!Stake) {
    return res.status(404).json({ message: "stake not found" });
  }
  const user = await prisma.sleep.findMany({
    where: {
      userid: Stake.Userid,
    },
  });

  const Sleepmap: any = {};
  user.map((users) => {
    Sleepmap[users.day] = users.Hours || "0h 0m";
  });
  //   console.log(Sleepmap);
  let date = new Date(Stake.startdate);
  let i = 0;
  if (Stake.Hours == null) {
    return res.status(400).json({ message: "Error" });
  }
  console.log("Stake.Hours", Stake.Hours);
  const Stakehour = parseDuration(Stake.Hours);
  let amount = 0;
  const solperday = Stake.amount / Stake.Days;
  console.log("solperday", solperday);
  while (i < Stake.Days) {
    // console.log(Sleepmap[date.toISOString().split("T")[0]]);
    const dayhour = parseDuration(Sleepmap[date.toISOString().split("T")[0]]);
    if (dayhour < Stakehour) {
      const diff = Stakehour - dayhour;
      const penaltyper = 2 / 100 / 60;
      console.log("penalty", penaltyper);
      console.log("diff", diff);
      const penalty = solperday * penaltyper * diff;
      amount += solperday - penalty;
    } else {
      amount += solperday + solperday * (1 / 100);
    }
    date.setDate(date.getDate() + 1);
    i++;
  }
  await prisma.stakePayment.create({
    data: {
      amount: amount,
      stakeId: stake.id,
    },
  });
  return res.status(200).json({
    message: "USer successfully completed the Stake contest",
    amount: amount,
  });
});

function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  return hours * 60 + minutes;
}
export const stakerouter = router;
