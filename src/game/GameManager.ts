import { MqttClient } from "mqtt";
import { sendConfigGame, sendStartingGame } from "../mqtt/sendMessage";
import {isHexColor,isInFlags} from "../utils/Utils";
import initConnexion, { CaptureFlag, ConfigCaptureFlag } from "../mqtt/mqttManager";
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
    private stateGame:StateGame = StateGame.INIT
    private gameData: GameType = {
        flags: [],
        teams: [],
        config: {
            capture_cooldown: 1,
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
        this.gameData.client = initConnexion()
    }
    launchGame(){
        if(this.gameData.flags.length === 0 || this.gameData.teams.length < 2) return false
        if(!this.gameData.client ||this.stateGame != StateGame.INIT) return false
        sendStartingGame(this.gameData.client)
        this.stateGame = StateGame.PLAY
    }
    mainGame(){

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
            if(!this.gameData.flags.find((v) => (v.id_flag == id_flag))) return
            this.gameData.flags.push({
                id_flag: id_flag,
                capture_team : null,
                flagState : FlagState.NEUTRAL
            })
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
        if(isInFlags(this.gameData.flags,message.flagId) && this.stateGame == StateGame.PLAY ){
            const flag = this.gameData.flags.find((v) => v.id_flag == message.flagId)
            if(!flag) return
            if(flag.capture_team || flag.capture_team != message.teamId){
                flag.flagState = FlagState.INPROGRESS
                flag.refTimeout =setTimeout(()=>{
                    callback("d")
                },this.gameData.config.capture_cooldown*1000)
                flag.capture_team = message.teamId;
                flag.flagState = FlagState.CAPTURED;

            }
        }
        callback(JSON.stringify(message))
    }
    async abortCapturFlag(message: CaptureFlag,callback: (payloadMessage:string)=> void){
        if(isInFlags(this.gameData.flags,message.flagId) && this.stateGame == StateGame.PLAY){
            const flag = this.gameData.flags.find((v) => v.id_flag == message.flagId)
            if(flag?.flagState == FlagState.INPROGRESS && flag.refTimeout){
                clearTimeout(flag.refTimeout)
            }
        }
    }
    
}
export default GameManager.getInstance()









