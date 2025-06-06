import e, { Router } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const router = Router();
router.post("/Sleep/cron",async(req:any,res:any)=>{
    const enddatespublic = await prisma.challenge.findMany({});
    console.log("check");
    for (const member of enddatespublic) {
      if (member.PayoutStatus == "payoutsucess") {
        const response = await axios.post(
          "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/challenge/retry",
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
                "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/step/verification",
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
              "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/challenge/finish",
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
    return res.status(200).json({message:"Succesfully Completed the day"});
})
router.post("/Step/cron",async(req:any,res:any)=>{
    const enddatespublic = await prisma.challenge.findMany({});
    for (const member of enddatespublic) {
      if (member.PayoutStatus == "payoutsucess") {
        const response = await axios.post(
          "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/challenge/retry",
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
                "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/sleep/verification",
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
              "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/challenge/finish",
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
    return res.status(200).json({message:"Succesfully Completed the day"});
})
router.post("/Stake/cron",async(req:any,res:any)=>{
    const stake=await prisma.stake.findMany({});
    const stakePayment=await prisma.stakePayment.findMany({
     where:{
       Status:"pending"
     }
    })
    for(const payment of stakePayment){
      await axios.post(`"https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/stake/payout`,{id:payment.id})     
    }
    for(let sta of stake ){
     console.log("dasd");
     const sleep=await prisma.sleep.findMany({where:{
       userid:sta.Userid
      }});
     if(sta.Status=="CurrentlyRunning"){
       const date=new Date(sta.Updateddate);
       if(sta.daycount==null){
         console.log("misseed");
         return;
       }
       console.log("dasdasd",sta.daycount);
       date.setDate(date.getDate()+1);
       const update=date.toISOString().split("T")[0];
       console.log("update",update);
       for(const sleeeps of sleep ){
          if(sleeeps.day==sta.Updateddate){
           console.log(sta.Updateddate);
            const parsedsleep=parseDuration(sleeeps.Hours);
            const parsedtarget=parseDuration(sta.Hours);
             if(parsedsleep>=parsedtarget){
               sta=await prisma.stake.update({
                 where:{
                   id:sta.id
                 },data:{
                   currentday:{increment:1},
                   daycount:{increment:1},  
                   Target: { push: sta.daycount ?? 0}, 
                   Updateddate:update,
                   misseday:0
                 }
               })
              console.log("suceess",sta);
             }else{
               const diffMinutes = parsedtarget - parsedsleep;
               const penaltyRatePerMinute = 0.02 / 60
               let maxPenalty;

               if (sta.misseday >= 7) {
                 maxPenalty = sta.amount * 0.05; 
               } else if (sta.misseday >= 4) {
                 console.log("sta",sta.misseday)
                 maxPenalty = sta.amount * 0.03; 
                 console.log("sta",maxPenalty)
               } else {
                 maxPenalty = sta.amount * 0.02; 
               }
               let penalty = Math.min(
                 sta.amount * penaltyRatePerMinute * diffMinutes,
                 maxPenalty
               )
               penalty = Math.min(penalty, sta.WithdrawAmount);
               console.log("penalty",penalty);
               if(sta.WithdrawAmount-penalty<0){
                 await axios.post("https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/destake",{id:sta.id})
               }
          const penaltyDate = new Date().toISOString().split('T')[0]
          console.log(penaltyDate);
       sta= await prisma.stake.update({
         where:{
           id:sta.id,
         },data:{
           WithdrawAmount:{decrement:penalty},
           // startdate:penaltyDate,
           currentday:0,
           daycount:{increment:1},  
           NotAchieved: { push: sta.daycount ?? 0 },
           Updateddate:update,
           misseday:{ increment: 1 },
           Badges:[]
         }
        })
        console.log("failed",sta);
             }
             }
           }
       if(sta.currentday==7){
          sta=await prisma.stake.update({
            where:{
             id:sta.id
            },data:{
             Badges:{
               push:"seven_days"
             }
            }
          })
          await prisma.user.update({
           where:{
             id:sta.Userid
           },data:{
             Notification:{push:"You have recived a 7 day badge congrats!!!"}
           }
          })
       }
     if(sta.currentday==14){
       sta=await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"fourteen_days"
           }
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:"You have recived a 14 day badge congrats!!!"}
         }
        })
     } 
     if(sta.currentday==45){
       sta=await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"forty_five_days"
           }
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:"You have recived a 45 day badge congrats!!!"}
         }
        })
     } 
     if(sta.currentday==60){
       sta=await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"sixty_days"
           }
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:"You have recived a 60 day badge congrats!!!"}
         }
        })
     } 
     if(sta.currentday==30){
       const amount=sta.WithdrawAmount+1/100;
      sta= await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"thirty_days"
           },
           WithdrawAmount:amount
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:`You have recived a 30 day badge congrats!!! Now You can withrawl your amount ${amount}` }
         }
        })
     }
     if(sta.currentday==90){
       const amount=sta.WithdrawAmount+4/100;
     sta=  await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"ninty_days"
           },
           WithdrawAmount:amount
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:`You have recived a 30 day badge congrats!!! Now You can withrawl your amount ${amount}` }
         }
        })
     }  
     if(sta.currentday==180){
       const amount=sta.WithdrawAmount+5/100;
      sta= await prisma.stake.update({
         where:{
           id:sta.id
         },data:{
           Badges:{
             push:"one_eighty_days"
           },
           WithdrawAmount:amount
         }
       })
       await prisma.user.update({
         where:{
           id:sta.Userid
         },data:{
           Notification:{push:`You have recived a 30 day badge congrats!!! Now You can withrawl your amount ${amount}` }
         }
        })
     }
   
   }
    }
    return res.status(200).json({message:"Succesfully Completed the day"});
})
function parseDuration(duration: string): number {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
  }
export const StakeCronrouter=router
