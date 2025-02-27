import mqtt, { MqttClient } from "mqtt";
import { initReceiveMessage } from "./receiveMessage";
export enum MessageType{
    CAPTURE_FLAG = "capture_flag",
    CONFIG_FLAG = "conf_capture_flag"
}
export enum OrderType{
    CAPTURE="0",ABORTED="1",CONFIRM="2"
}
export type CaptureFlag = {
    teamId: string|number,
    flagId: string,
    type: OrderType
}
export type ConfigCaptureFlag= {
    flagId: string
    teamIds: [string, string][]
}

function initConnexion():MqttClient{
    console.log("Connection to "+ process.env.MQTT_HOST+":"+process.env.MQTT_PORT || "localhost:8883 ")
    const client_id = `mqtt_${Math.random().toString(16).slice(3)}`
    let client =mqtt.connect(process.env.MQTT_HOST+":"+process.env.MQTT_PORT|| "localhost:8883 ",{
        clientId : client_id,   
    })

    client.on("connect",() => {
        console.log('Connecté au broker MQTT');
        const messageTypes = Object.values(MessageType);
        for (const message of messageTypes) {
            client.subscribe(message,(err) => {
                if(err){
                    console.error(`${message} error : ${err}`)
                }else{
                    console.log(`${message} subscribe`)
                }
            })
        }
        console.log("Connected")
    })
    client.on("error",(err) => {
        console.error(err)
    })
    initReceiveMessage(client)
    return client
}

export default initConnexion