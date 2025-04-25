import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function Gettime() {
  const cronSchedule = `* * * * *`;
  cron.schedule(cronSchedule, async () => {
     const enddatemap=await prisma.stake.findMany({});
     for(const enddate of enddatemap){
          const date=new Date();
          date.setHours(0,0,0,0);
          const endates=new Date(enddate.enddate);
          
          
          
          endates.setHours(0,0,0,0);
          let status;
              if(date>endates && enddate.Status=="CurrentlyRunning"){
               status=await prisma.stake.update({
                  where:{
                      id:enddate.id
                  },data:{
                    Status:"Completed"
                  }
                })   
          }
          
          

     }  
})
}
