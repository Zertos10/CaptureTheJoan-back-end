import {app} from "../app"
import gameInstance from "../game/GameManager";
import { Request, Response } from "express";

function initRoute(){
    app.get("/start",startGame.bind(this))
    app.get("/stop",stopGame.bind(this))
}
function startGame(req:Request,res:Response){
    if(gameInstance.launchGame()){
        res.json({
            "statut":"game start"
        })
    }else{
        res.json({
            "statut":"missing requirements"
        })
    }
}
function stopGame(req:Request,res:Response){
    gameInstance.endGame()
    res.json({
        "statut":"game stop"
    })
}
export default initRoute
