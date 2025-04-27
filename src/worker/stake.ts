import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function getstake() {
  const cronSchedule = `* * * * *`;
  cron.schedule(cronSchedule, async () => {
    console.log("hey");
     const stake=await prisma.stake.findMany({});
     for(let sta of stake ){
      const sleep=await prisma.sleep.findMany({where:{
        userid:sta.Userid
       }});
       console.log(sta.id)
      if(sta.Status=="CurrentlyRunning"){
        const date=new Date(sta.Updateddate);
        date.setDate(date.getDate()+sta.currentday);
        const update=date.toISOString().split("T")[0]; 
        // console.log("update",update);
        for(const sleeeps of sleep ){
          console.log("sleep",sleeeps.day)
          console.log("updated",sta.Updateddate)
           if(sleeeps.day==sta.Updateddate){
             const parsedsleep=parseDuration(sleeeps.Hours);
             const parsedtarget=parseDuration(sta.Hours);
             console.log("sywa",sta);
             console.log("parsed",parsedsleep)
             console.log("parsed2",parsedtarget)
              if(parsedsleep>=parsedtarget){
                console.log("suceess");
                sta=await prisma.stake.update({
                  where:{
                    id:sta.id
                  },data:{
                    currentday:sta.currentday+1,
                    Updateddate:update,
                    misseday:0
                  }
                })
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
                  await axios.post("http://localhost:3000/api/v1/destake",{id:sta.id})
                }
           const penaltyDate = new Date().toISOString().split('T')[0]
        sta= await prisma.stake.update({
          where:{
            id:sta.id,
          },data:{
            WithdrawAmount:{decrement:penalty},
            startdate:penaltyDate,
            currentday:0,
            Updateddate:penaltyDate,
            misseday:{ increment: 1 }
          }
         })
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
})
}
function parseDuration(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  return hours * 60 + minutes;
}
