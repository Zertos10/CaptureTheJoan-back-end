import { MqttClient } from "mqtt";
import { CaptureFlag, ConfigCaptureFlag, MessageType } from "./mqttManager"; 

export function sendTeams(client:MqttClient,teams:Map<string,string>){
    teams.forEach((id_team,color) => {
        client.publish(MessageType.CONFIG_FLAG,"")
    });
}
export function sendConfigGame(client:MqttClient, config: ConfigCaptureFlag){
    console.log(config)
    let config_json = JSON.stringify(config)
    console.log(config_json)
    client.publish(MessageType.CONFIG_FLAG,config_json)
}
export function sendStartingGame(client:MqttClient){
    client.publish(MessageType.CONFIG_FLAG,'{"order":0}')
}
export function sendCaptureComplete(client:MqttClient,flag:CaptureFlag){
    let flag_stringify=JSON.stringify(flag)
    client.publish(MessageType.CAPTURE_FLAG,flag_stringify)
}