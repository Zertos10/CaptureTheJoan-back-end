import mqtt from "mqtt";
import { receiveMessage } from "./receiveMessage";
export enum MessageType{
    CAPTURE_FLAG = "capture_flag",
    CONFIG_FLAG = "conf_capture_flag",
    RESET_FLAG = "reset_flag"

}
function MQTTManagers(){
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
    receiveMessage(client)
    
}

export default MQTTManagers