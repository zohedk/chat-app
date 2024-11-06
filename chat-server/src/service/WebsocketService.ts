import { Redis } from "ioredis";
import { WebSocket } from "ws";
import { createRedisClient } from "../clients/redis";
import { MessageType, Payload } from "../utils/types";

export class WebSocketService {
  private static _instance: WebSocketService | null = null;
  private room: Map<
    string, // roomId
    {
      userId: string;
      ws: WebSocket;
    }[]
  >;
  private pub: Redis;
  private sub: Redis;
  private subscribedRooms: Set<string>; // Track subscribed rooms

  private constructor() {
    this.room = new Map();
    this.pub = createRedisClient();
    this.sub = createRedisClient();
    this.subscribedRooms = new Set(); // Initialize the set for tracking subscriptions
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService._instance) {
      WebSocketService._instance = new WebSocketService();
    }
    return WebSocketService._instance;
  }

  public addUser({
    roomId,
    userId,
    ws,
  }: {
    roomId: string;
    userId: string;
    ws: WebSocket;
  }): void {
    if (!this.room.has(roomId)) {
      // Initializing the room if it doesn't exist
      this.room.set(roomId, []);
    }

    // Adding user and WebSocket connection to the room
    const roomUsers = this.room.get(roomId);
    roomUsers?.push({ userId, ws });

    // Only subscribing if we haven't subscribed to this room already
    if (!this.subscribedRooms.has(roomId)) {
      this.subscribedRooms.add(roomId); // Marking the room as subscribed
      this.sub.subscribe(roomId, (err, count) => {
        if (err) {
          console.log(`Error subscribing to ${roomId}:`, err);
          return;
        }
      });
    }
  }

  public removeUser({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): void {
    try {
      const roomUsers = this.room.get(roomId);

      if (roomUsers) {
        const updatedUsers = roomUsers.filter((user) => user.userId !== userId);
        this.room.set(roomId, updatedUsers);

        // If the room is empty, delete the room and unsubscribe from the Redis channel
        if (updatedUsers.length === 0) {
          this.room.delete(roomId);

          // Unsubscribe from Redis for this room
          this.sub.unsubscribe(roomId, (err) => {
            if (err) {
              console.log(`Error unsubscribing from ${roomId}:`, err);
              return;
            }

            this.subscribedRooms.delete(roomId); // Remove from the subscribed set
          });
        }
        // if (updatedUsers.length !== 0) {
        //   console.log(`total user in room ${roomId}`, updatedUsers);
        // }
      }
    } catch (error) {
      console.log("remove user error", error);
    }
  }

  public lookForMessages() {
    this.sub.on("message", (roomId, payload) => {
      const usersInRoom = this.room.get(roomId);
      if (usersInRoom) {
        usersInRoom.forEach(({ ws }) => {
          ws.send(payload);
        });
      }
    });
  }

  public publishMessage(type: MessageType, payload: Payload<"message">): void {
    this.pub.publish(
      payload.roomId,
      JSON.stringify({
        type,
        payload:
          type === "message"
            ? {
                ...payload,
                createdAt: new Date(Date.now()),
              }
            : { ...payload },
      }),
      (err) => {
        if (err) {
          console.log(`Error publishing message:`, err);
          return;
        }
      }
    );
  }
}
