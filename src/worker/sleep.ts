import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function Getsleep() {
  const cronSchedule = `* * * * *`;
  cron.schedule(cronSchedule, async () => {
    const enddatespublic = await prisma.challenge.findMany({});
    for (const member of enddatespublic) {
      if (member.PayoutStatus == "payoutsucess") {
        const response = await axios.post(
          "https://decentralize-gpfwdje9e7guf4hu.canadacentral-01.azurewebsites.net/api/v1/challenge/retry",
          { id: member.id }
        );
        const challengeid = await prisma.remainingPerson.findMany({
          where: {
            challengeId: member.id,
          },
        });
        if (challengeid.length == 0) {
          await prisma.challenge.update({
            where: {
              id: member.id,
            },
            data: {
              PayoutStatus: "completed",
            },
          });
        }
      }
      if (
        member.PayoutStatus == "payoutsucess" ||
        member.PayoutStatus == "completed"
      ) {
        continue;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(member.enddate);
      endDate.setHours(0, 0, 0, 0);
      let status;
      if (member.status === "CurrentlyRunning" && endDate < today) {
        status = await prisma.challenge.update({
          where: {
            id: member.id,
          },
          data: {
            status: "Completed",
          },
        });
      }
      try {
        if (member.status === "Completed" || endDate < today) {
          if (member.PayoutStatus === "pending") {
            const publicmember = member.members;
            for (const user of publicmember) {
              const response = await axios.post(
                "https://decentralize-gpfwdje9e7guf4hu.canadacentral-01.azurewebsites.net/api/v1/sleep/verification",
                {
                  startdate: member.startdate,
                  enddate: member.enddate,
                  userid: user,
                  challengeid: member.id,
                }
              );
              console.log("data", response.data);
            }
            const response = await axios.post(
              "https://decentralize-gpfwdje9e7guf4hu.canadacentral-01.azurewebsites.net/api/v1/challenge/finish",
              { id: member.id }
            );
            console.log(response.data);
            const payoutmap = await prisma.payoutPerson.findMany({
              where: {
                challengeId: member.id,
              },
            });
            const remainig = await prisma.remainingPerson.findMany({
              where: {
                challengeId: member.id,
              },
            });
            if (payoutmap.length === 0 && remainig.length === 0) {
              await prisma.challenge.update({
                where: {
                  id: member.id,
                },
                data: {
                  PayoutStatus: "completed",
                },
              });
            } else {
              await prisma.challenge.update({
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
      } catch (e) {
        console.log(e);
      }
    }
  });
}
