import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function Gettime() {
  const cronSchedule = `* * * * *`;
  cron.schedule(cronSchedule, async () => {
     const stake=await prisma.stake.findMany({});
     for(const sta of stake  ){
      const sleep=await prisma.sleep.findMany({where:{
        id:sta.Userid
       }});
      if(sta.Status=="CurrentlyRunning"){
        const date=new Date(sta.startdate);
        date.setDate(date.getDate()+sta.currentday);
        const update=date.toISOString().split("T")[0];
        for(const sleeeps of sleep ){
           if(sleeeps.day==update){
              if(sleeeps.Hours>=sta.Hours){
                await prisma.stake.update({
                  where:{
                    id:sta.id
                  },data:{
                    currentday:sta.currentday+1
                  }
                })
              } 
           }
        }
        if(sta.currentday==7){
           await prisma.stake.update({
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
        await prisma.stake.update({
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
        const amount=sta.amount+1/100;
        await prisma.stake.update({
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
            Notification:{push:"You have recived a 30 day badge congrats!!!"}
          }
         })
      }
      if(sta.currentday==90){
        const amount=sta.WithdrawAmount+4/100;
        await prisma.stake.update({
          where:{
            id:sta.id
          },data:{
            Badges:{
              push:"ninty_days"
            },
            WithdrawAmount:amount
          }
        })
      }  
      if(sta.currentday==180){
        const amount=sta.WithdrawAmount+7/100;
        await prisma.stake.update({
          where:{
            id:sta.id
          },data:{
            Badges:{
              push:"one_eighty_days"
            },
            WithdrawAmount:amount
          }
        })
      }
    
    }
     }
})
}
