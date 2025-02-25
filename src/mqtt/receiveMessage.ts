import { MqttClient } from 'mqtt'
import {  CaptureFlag, MessageType } from './mqttManager'
import gameInstance from '../game/GameManager'


export async function initReceiveMessage (client: MqttClient){
    client.on("message",(topic,message) => {
        if(topic == MessageType.CAPTURE_FLAG){
            console.log(message.toString())
            try{
                let messages = JSON.parse(message.toString())
                console.log(messages)
                let captureFlags:CaptureFlag = {
                    flagId : messages["flag_id"],
                    teamId : Number(message["team_id"]),
                    type : Number(message["type"])
                }
                console.log(captureFlags)
                gameInstance.captureFlag(captureFlags,() => {
                    // client.publish(MessageType.CONFIG_FLAG,"zd")
                })
            }catch(err){
                console.error(err)
            }
        }
        if(topic == MessageType.CONFIG_FLAG){
            try{
                let mes = message.toString()
                console.log(mes)
                let parsedMessage = JSON.parse(mes)
                console.log(parsedMessage)
                if (parsedMessage.flag_id) {
                    gameInstance.addFlag(parsedMessage["flag_id"])
                }
            }catch(e){
                console.error(e)
            }
        }
    })
}

