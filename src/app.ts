import express, { Request, Response, Express } from "express";
import gameInstance from "./game/GameManager";

const app:Express = express();

const port = process.env.PORT || 3000;

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"Hello World"});
    gameInstance.launchGame()
})
app.get('/reset',(req:Request,res:Response)=> {
  res.json({message:"Game reset"}) 
  gameInstance.initGame()
  gameInstance.addTeam("0","ff00ff")
  gameInstance.addTeam("1","fa00ff")

})
gameInstance.addTeam("1","00ffe1")
gameInstance.addTeam("0","ff003c")
let client =gameInstance.getClient()

process.on("SIGTERM",() => {
    console.log("Arrêt du serveur")
    gameInstance.endGame()
})

app.listen(port, () => {
    console.log("The server running at http://localhost:"+port);
})
export default app;