import express, { Request, Response, Express } from "express";
import gameInstance from "./game/GameManager";
import initRoute from "./request/RestRequest";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"
const app:Express = express();

const port = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())

// app.get('/',(req:Request,res:Response)=>{
//     res.json({message:"Hello World"});
//     gameInstance.launchGame()
// })
app.get('/reset',(req:Request,res:Response)=> {
  res.json({message:"Game reset"}) 
  gameInstance.initGame()
  gameInstance.addTeam("0","ff00ff")
  gameInstance.addTeam("1","0e0ef0")

})
gameInstance.addTeam("1","00ffe1")
gameInstance.addTeam("0","ff003c")
initRoute()
let client =gameInstance.getClient()

process.on("SIGTERM",() => {
    console.log("Arrêt du serveur")
    gameInstance.endGame()
})
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

httpServer.listen(port,() => {
    console.log(`Serveur démarrer sur le port ${port}`)
})
export {app,port};