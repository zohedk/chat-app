import cluster from "cluster";
import os from "os";
import httpServer from "./app";
import dotenv from "dotenv";
import { WebSocketService } from "./service/WebsocketService";

dotenv.config();

const PORT = process.env.PORT;

//
const numberOfCpu = os.cpus().length;

function spawn() {
  const worker = cluster.fork();
  return worker;
}

function init() {
  if (cluster.isPrimary) {
    for (let i = 0; i <= numberOfCpu; i++) {
      spawn();
    }
  } else {
    console.log(` starting worker  on process ${process.pid}`);
    // this will look for messages on all chanells (roomId)
    WebSocketService.getInstance().lookForMessages();
    httpServer.listen(PORT);
  }
}

init();
