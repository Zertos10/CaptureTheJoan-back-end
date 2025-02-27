import { io } from "../app"

export function broadcastMessage(event:string,data:any){
    io.emit(event,data)
}

