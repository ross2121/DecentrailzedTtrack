interface room{
    username:string,
    steps:string,
    xp:string,
    Earn:string
}
const rooms:Map<string,room>=new Map();
export const adduser=(Room:room,userid:string)=>{
   rooms.set(userid,Room);
   
}