import { MqttClient } from 'mqtt'
import { MessageType } from './mqttManager'
export type CaptureFlag = {
    teamId: String,
    datetime:Date,
    flagId: String
}
function receiveMessage(client: MqttClient){
    client.on("message",(topic,message,packet) => {
        if(topic == MessageType.CAPTURE_FLAG){
            let messages = message.toJSON()
            try{
                let captureFlags:CaptureFlag = {
                    datetime : messages["datetime"],
                    flagId : messages["flag_id"],
                    teamId : message["team"]
                } 
                captureFlag(captureFlags,() => {
                    client.publish(MessageType.CONFIRMATION_CAPTURE_FLAG,"zd")
                })
            }catch(err){
                console.error(err)
            }
        }
    })
}
async function captureFlag(message: CaptureFlag, callback: (payloadMessage:string) => void){
    callback(JSON.stringify(message))
}