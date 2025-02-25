import { MqttClient } from 'mqtt'
import { MessageType } from './mqttManager'

let id_clients: string[] = [] 
enum OrderType{
    CAPTURE=0,ABORTED=1,CONFIRM=2
}
export type CaptureFlag = {
    teamId: String,
    flagId: String,
    type: OrderType
}
export type ConfigCaptureFlag= {
    teamIds:string[]
}
export function receiveMessage(client: MqttClient){
    client.on("message",(topic,message) => {
        if(topic == MessageType.CAPTURE_FLAG){
            console.log(message.toString())
            try{
                let messages = JSON.parse(message.toString())
                console.log(messages)
                let captureFlags:CaptureFlag = {
                    flagId : messages["flag_id"],
                    teamId : message["team_id"],
                    type : message["type"]
                }
                console.log(captureFlags)
                captureFlag(captureFlags,() => {
                    client.publish(MessageType.CONFIG_FLAG,"zd")
                })
            }catch(err){
                console.error(err)
            }
        }
        if(topic = MessageType.CAPTURE_FLAG){
            try{
                let mes = message.toString()
                if(!id_clients.includes(mes)){
                    console.log(mes)
                    id_clients.push(mes)
                }
            }catch(e){
                console.error(e)
            }
        }
    })
}
async function captureFlag(message: CaptureFlag, callback: (payloadMessage:string) => void){
    callback(JSON.stringify(message))
}