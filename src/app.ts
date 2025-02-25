import express, { Request, Response, Express } from "express";
import gameInstance from "./game/GameManager";
import { sendCaptureComplete } from "./mqtt/sendMessage";

const app:Express = express();

const port = process.env.PORT || 3000;

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"Hello World"});
    gameInstance.launchGame()
})
gameInstance.addTeam("2","ff00ff")
gameInstance.addTeam("1","fa00ff")
let client =gameInstance.getClient()
if(client){
    // sendCaptureComplete(client,{
    //     flagId : "esp32-client-CC:DB:A7:9E:2D:0C",
    //     teamId: "teamA",
    //     type: OrderType.CONFIRM
    // })
}


app.listen(port, () => {
    console.log("The server running at http://localhost:"+port);
})
export default app;