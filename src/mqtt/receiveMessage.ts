import { MqttClient } from 'mqtt'
import {  CaptureFlag, MessageType, OrderType } from './mqttManager'
import gameInstance from '../game/GameManager'


export async function initReceiveMessage (client: MqttClient){
    client.on("message",(topic,message) => {
        console.log(message.toString())
        if(topic == MessageType.CAPTURE_FLAG){
            try{
                let messages = JSON.parse(message.toString())
                let captureFlags:CaptureFlag = {
                    flagId : messages["flag_id"],
                    teamId : messages["team_id"],
                    type : messages["type"]
                }
                if(captureFlags.type === OrderType.ABORTED){
                    console.log("aborted")
                    gameInstance.abortCapturFlag(captureFlags,(mes) => {
                        client.publish(MessageType.CAPTURE_FLAG,mes,(log) => {
                            console.log(log)
                        })
                    })
                }else if(captureFlags.type === OrderType.CAPTURE){
                    console.log("capture")
                    gameInstance.captureFlag(captureFlags,(message) => {
                        client.publish(MessageType.CAPTURE_FLAG,message)
                    })
                }
               
            }catch(err){
                console.error(err)
            }
        }
        if(topic == MessageType.CONFIG_FLAG){
            try{
                let mes = message.toString()
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

