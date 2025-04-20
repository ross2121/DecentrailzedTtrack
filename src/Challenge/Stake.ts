import { Stake } from "./../../node_modules/.prisma/client/index.d";
import { Express, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Staketype } from "../Auth/type";
const prisma = new PrismaClient();
const router = Router();
router.post("/create/stake", async (req: any, res: any) => {
  const { userid, amount, Hours, days, Startdate, enddate } = req.body;
  if (!userid || !amount || !Hours || !days || !Startdate || !enddate) {
    return res.status(400).json({ message: "please provide all the fields" });
  }
  const safeparse = Staketype.safeParse(req.body);
  if (!safeparse.success) {
    return res.status(400).json({ message: safeparse.error.format() });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
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
  return res.status(200).json({ message: "stake created successfully", stake });
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
      console.log("amount correct", amount);
    } else {
      amount += solperday + solperday * (1 / 100);
      console.log("at", solperday + solperday * (1 / 100));
      console.log("amount", amount);
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
