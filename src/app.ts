import express, { Request, Response, Express } from "express";
import MQTTManagers from "./mqtt/mqttManager";

const app:Express = express();

const port = process.env.PORT || 3000;

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"Hello World"});
})
MQTTManagers()
app.listen(port, () => {
    console.log("The server running at http://localhost:"+port);
})
export default app;