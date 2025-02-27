import { MqttClient } from "mqtt";
import { sendConfigGame, sendStartingGame } from "../mqtt/sendMessage";
import {isHexColor,isInFlags} from "../utils/Utils";
import initConnexion, { CaptureFlag, ConfigCaptureFlag, OrderType } from "../mqtt/mqttManager";
import { broadcastMessage } from "../request/GameWebSocket";
export enum StateGame{
    INIT,IDLE,PLAY,END
}
export enum FlagState{
    CAPTURED,INPROGRESS,NEUTRAL
}

type GameType={
    flags:FlagType[],
    teams:TeamsType[],
    config:ConfigGame,
    client?: MqttClient
}
type TeamsType={
    id_team:string,
    color:string,
    score:number
}
type ConfigGame={
    capture_cooldown:number,
    time:number
}
export type FlagType={
    id_flag:string,
    capture_team:string|number|null,
    refTimeout?: NodeJS.Timeout,
    flagState : FlagState
}

export class GameManager{
    private static instance:GameManager
    private scoringInterval:NodeJS.Timeout|undefined
    private stateGame:StateGame = StateGame.INIT
    private gameData: GameType = {
        flags: [],
        teams: [],
        config: {
            capture_cooldown: 5,
            time: 0
        }
    }
    private constructor(){
        this.initGame()
    }
    public static getInstance():GameManager{
        if(!GameManager.instance){
            GameManager.instance = new GameManager();
        }
        return GameManager.instance
    }
    initGame(){
        this.stateGame = StateGame.INIT
        this.gameData.teams = []
        this.gameData.flags = []
        if(!this.gameData.client){
            this.gameData.client = initConnexion()
        }
    }
    launchGame(){
        console.log(`call launch game : lenght flags ${this.gameData.flags.length} teams lenght ${this.gameData.teams.length}`)
        if(this.gameData.flags.length === 0 || this.gameData.teams.length < 2) return false
        if(!this.gameData.client ||this.stateGame != StateGame.INIT) return false
        console.log("launch game")
        sendStartingGame(this.gameData.client)
        this.stateGame = StateGame.PLAY
        this.scoringInterval =setInterval(() => {
            this.scoring()
            this.gameData.config.time += 1*1000
            broadcastMessage("timer",Number(this.gameData.config.time))
            broadcastMessage("flags",this.gameData.flags.map((v) => ({
                id_flag: v.id_flag,
                flagState : Number(v.flagState),
                capture_team : String(v.capture_team)
            })))
        },1000)
        return true
    }

    endGame():TeamsType[]{
        clearInterval(this.scoringInterval)
        this.stateGame == StateGame.END
        return []
    }
    getScore():Map<string,number>{
        const teamSocket = ["scoreBleu","scoreRouge"]
        const scoreMap = new Map<string,number>()
        this.gameData.teams.forEach(team => {
            scoreMap.set(team.id_team,team.score)
            if(this.gameData.teams.length <=2){
                if(team.id_team === "0"){
                    broadcastMessage(teamSocket[0],team.score)
                }else{
                    broadcastMessage(teamSocket[1],team.score)
                }
            }

        });
        return scoreMap
    }
    addTeam(id_team:string,color:string){
        if(isHexColor(color) && this.stateGame != StateGame.PLAY){
            this.gameData.teams.push({
                id_team : id_team,
                color: color,
                score : 0
            })
        }
    }
    removeTeam(id_team:string){
        if(this.stateGame != StateGame.PLAY){
            this.gameData.teams = this.gameData.teams.filter(team => team.id_team !== id_team)
        }
    }
    addFlag(id_flag:string){
        if(this.stateGame != StateGame.PLAY){
            if(!this.gameData.flags.find((v) => (v.id_flag == id_flag))){
                console.log("addFlag")
                this.gameData.flags.push({
                    id_flag: id_flag,
                    capture_team : null,
                    flagState : FlagState.NEUTRAL
                }) 
            }
            
        }
        console.log(this.gameData.teams)
        const teamIds = new Map(this.gameData.teams.map(team => [team.id_team, team.color]));
        const mapAsArray = Array.from(teamIds.entries())
        console.log('teamIds :', mapAsArray);
        const config:ConfigCaptureFlag = {
            flagId : id_flag,
            teamIds : mapAsArray
        }
        if (this.gameData.client) {
            sendConfigGame(this.gameData.client, config);
        }
    }
    removeFlag(id_flag:string){
        if(this.stateGame != StateGame.PLAY){
            this.gameData.flags = this.gameData.flags.filter(flag => flag.id_flag !== id_flag)
        }
    }
    getClient(){
        if(this.gameData.client){
            return this.gameData.client
        }
    }
    async captureFlag(message: CaptureFlag, callback: (payloadMessage:string) => void){
        if(isInFlags(this.gameData.flags,message.flagId) && this.stateGame == StateGame.PLAY){
            const flag = this.gameData.flags.find((v) => v.id_flag == message.flagId)
            if(!flag) return
            if(flag.capture_team || flag.capture_team != message.teamId){
                flag.flagState = FlagState.INPROGRESS
                flag.refTimeout =setTimeout(()=>{
                    console.log("Flag "+message.flagId+" captured by "+message.teamId)
                    const complete:CaptureFlag = {
                        flagId : message.flagId,
                        teamId : message.teamId,
                        type : OrderType.CONFIRM
                    }
                    const flagIndex = this.gameData.flags.findIndex((v) => v.id_flag == message.flagId);
                    if (flagIndex !== -1) {
                        this.gameData.flags[flagIndex].capture_team = String(complete.teamId)
                        this.gameData.flags[flagIndex].flagState = FlagState.CAPTURED
                    }
                    const request =JSON.stringify(complete)
                    callback(request)
                },this.gameData.config.capture_cooldown*1000)

            }
        }
    }
    async scoring() {
        this.gameData.flags.forEach(flag => {
            if (flag.capture_team) {
                const team = this.gameData.teams.find(team => team.id_team === String(flag.capture_team));
                if (team) {
                    team.score += 1;
                }
            }
        });
        this.getScore()
    }
    
    async abortCapturFlag(message: CaptureFlag,callback: (payloadMessage:string)=> void){
        console.log("Flag state: "+this.getFlagById(message.flagId)?.flagState)
        if(isInFlags(this.gameData.flags,message.flagId) 
            && this.stateGame == StateGame.PLAY 
            && this.getFlagById(message.flagId)?.flagState != FlagState.CAPTURED){
            const flag = this.gameData.flags.find((v) => v.id_flag == message.flagId)
            if(flag?.flagState == FlagState.INPROGRESS && flag.refTimeout){

                clearTimeout(flag.refTimeout)
                flag.refTimeout = undefined
                console.log("Flag :"+flag.id_flag +" capture is aborted")
            }
        }
    }
    getFlagById(idFlag:string){
        return this.gameData.flags.find((v) => v.id_flag == idFlag)
    }
}
export default GameManager.getInstance()









