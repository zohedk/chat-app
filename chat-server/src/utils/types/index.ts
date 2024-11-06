import WebSocket from "ws";

export type MessageType = "join" | "message" | "typing" | "not-typing";

export type Payload<T extends MessageType> = T extends "join"
  ? { userId: string; roomId: string }
  : T extends "message"
  ? Payload<"join"> & { message: string; messageId: string; userName: string }
  : Payload<"join">;

export interface CustomWebSocket extends WebSocket {
  roomId: string;
  userId: string;
}
