import { ChatPanelContextProp, useChatPanle } from "@/context/ChatPanelContext";
import { ChatResponse, MessageType, Payload } from "@/utils/types";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  addMessageToDb,
  useSetLatestMessage,
  useSetUnreadMessage,
} from "../chats";
import { debounce } from "../user";

// prduction
const WEB_SOCKET_URL = "wss://chat-app-5sl1.onrender.com";
// dev
// const WEB_SOCKET_URL = "ws://localhost:8000";

// this function will put the room with latest message on top
export function reshuffleRooms({
  roomId,
  rooms,
  setRooms,
}: {
  roomId: number;
  rooms: ChatPanelContextProp["rooms"];
  setRooms: ChatPanelContextProp["setRooms"];
}) {
  if (!rooms) return;
  if (rooms[0].id === roomId) {
    return;
  }
  const roomToPutOnTop = rooms.filter(({ id }) => roomId === id)[0];

  setRooms((currentRoom) => {
    // first filter out the room
    if (!currentRoom) return null;

    const filterdRoom = currentRoom.filter(({ id }) => roomId !== id);
    // then add it to the top
    const newRoom =
      filterdRoom.length > 0 ? [roomToPutOnTop, ...filterdRoom] : currentRoom;

    return newRoom;
  });
}

export function useWebSocket({ roomId }: { roomId?: number }) {
  //
  const { addUnreadMessage, updateMessageStatus } = useSetUnreadMessage();
  const { data: sessionData } = useSession();
  const {
    selectedRoom,
    selectedUser,
    setRooms,
    rooms,
    setRoomMessages,
    setIsTypingInTheRoom,
  } = useChatPanle();
  const { updateLatestMessage } = useSetLatestMessage();
  //
  useEffect(() => {
    if (sessionData && roomId) {
      // Only connect when session data is available
      const socket = new WebSocket(WEB_SOCKET_URL);

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "join",
            payload: {
              userId: sessionData.user.userId,
              roomId: `${roomId}`,
            },
          })
        );
      };

      // Handle WebSocket message event
      socket.onmessage = async (event) => {
        const { type, payload } = JSON.parse(event.data) as {
          type: MessageType;
          payload: {
            message: string;
            userId: string;
            roomId: string;
            messageId: string;
            createdAt: Date;
            userName: string;
          };
        };

        if (type === "message") {
          const tempMessageObj: ChatResponse = {
            id: payload.messageId,
            roomId: parseInt(payload.roomId),
            content: payload.message,
            createdAt: payload.createdAt,
            updatedAt: payload.createdAt,
            userId: payload.userId,
            user: {
              name: payload.userName,
            },
            readBy: [],
          };

          reshuffleRooms({ roomId, rooms, setRooms });
          //TODO:SET LATEST MESSAGE

          updateLatestMessage(`${roomId}`, tempMessageObj);

          if (selectedRoom && selectedRoom.id === roomId) {
            // if loged in user is sending message play this sound or else receiving message
            if (payload.userId === sessionData.user.userId) {
              const message = new Audio("/sending-message.mp3");
              await message.play().catch((e) => {
                console.error("Error playing sound:", e);
              });
            } else {
              const message = new Audio("/message.mp3");
              await message.play().catch((e) => {
                console.error("Error playing sound:", e);
              });
              updateMessageStatus(roomId, payload.messageId);
            }
            // updating message status to true if room is selected room is selected
            //
            setRoomMessages((currentMessages) => {
              const updatedMessages = [tempMessageObj, ...currentMessages];
              console.log("updated messaged: ", updatedMessages);
              return updatedMessages;
            });
          }

          // notification
          if (selectedRoom && selectedRoom.id !== roomId) {
            //  Icrementing the unread message count
            addUnreadMessage({
              messageId: payload.messageId,
              roomId: `${roomId}`,
            });
            const notificationSound = new Audio("/notification.mp3");
            await notificationSound.play().catch((e) => {
              console.error("Error playing sound:", e);
            });
          }
          //
          if (!selectedRoom) {
            //  add unread message
            addUnreadMessage({
              messageId: payload.messageId,
              roomId: payload.roomId,
            });
          }
        }

        if (sessionData.user.userId !== payload.userId) {
          if (type === "typing") {
            setIsTypingInTheRoom((currentState) => {
              const updatedState: typeof currentState = {
                ...currentState,
                [`${payload.roomId}`]: {
                  isTyping: true,
                  userId: payload.userId,
                },
              };

              return updatedState;
            });
          }
          //
          if (type === "not-typing") {
            setIsTypingInTheRoom((currentState) => {
              const updatedState: typeof currentState = {
                ...currentState,
                [`${payload.roomId}`]: {
                  isTyping: false,
                  userId: payload.userId,
                },
              };

              return updatedState;
            });
          }
        }
      };

      // Handle WebSocket errors
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Clean up on unmount
      return () => {
        socket.close();
      };
    }
  }, [sessionData, selectedRoom, selectedUser]);
}

//send message
export const useSendMessage = (roomId?: number) => {
  const { data: sessionData } = useSession();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const messageQueue = useRef<
    {
      type: string;
      payload: {
        roomId: string;
        userId: string;
        userName: string;
        message: string;
        messageId?: string;
      };
    }[]
  >([]); // Queue for messages

  useEffect(() => {
    if (sessionData && roomId) {
      // Only connect when session data is available
      const socketConnection = new WebSocket(WEB_SOCKET_URL);

      socketConnection.onopen = () => {
        //
        setIsConnected(true);
        setSocket(socketConnection);

        socketConnection.send(
          JSON.stringify({
            type: "join",
            payload: {
              userId: sessionData.user.userId,
              roomId: `${roomId}`,
            },
          })
        );

        // send message from the queue
        while (messageQueue.current.length > 0) {
          const message = messageQueue.current.shift();

          socketConnection.send(JSON.stringify(message));
        }
      };

      // Handle WebSocket errors
      socketConnection.onerror = (error) => {
        // console.error("WebSocket error:", error);
        setIsConnected(false);
        setSocket(null);
      };
      // Clean up on unmount
      return () => {
        socketConnection.close();

        setIsConnected(false);
        setSocket(null);
      };
    }
  }, [roomId]);

  const handleSendMessage = async (
    payload: Omit<Payload<"message">, "userId">
  ) => {
    if (!sessionData) {
      return toast.error("Not loged in");
    }

    const messageRespones = await addMessageToDb(
      payload.message,
      parseInt(payload.roomId)
    );

    if (!socket || !isConnected) {
      messageQueue.current.push({
        type: "message",
        payload: {
          roomId: payload.roomId,
          userId: sessionData.user.userId,
          userName: sessionData.user.name,
          message: payload.message,
          messageId: messageRespones!.createdMessage.id,
        },
      });

      return;
    }
    socket.send(
      JSON.stringify({
        type: "message",
        payload: {
          ...payload,
          messageId: messageRespones!.createdMessage.id,
          userId: sessionData.user.userId,
          userName: sessionData.user.name,
        },
      })
    );
  };

  const sendMessage = useCallback(handleSendMessage, [
    roomId,
    socket,
    isConnected,
  ]);

  // notifying other user's that we are typing
  const handleSendTypingNotifiction = () => {
    if (!sessionData) {
      toast.error("Not loged in");
      return;
    }

    if (!socket || !isConnected) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "typing",
        payload: {
          roomId: `${roomId}`,
          userId: sessionData.user.userId,
          uaserName: sessionData.user.name.split(" ")[0],
        },
      })
    );
  };

  const sendTypingNotification = useCallback(handleSendTypingNotifiction, [
    roomId,
    socket,
    isConnected,
  ]);

  const sendUserStopTyping = useCallback(
    debounce((setIsTyping: any) => {
      if (!sessionData) {
        toast.error("Not loged in");
        return;
      }

      if (!socket || !isConnected || !roomId) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: "not-typing",
          payload: {
            roomId: `${roomId}`,
            userId: sessionData.user.userId,
          },
        })
      );
      setIsTyping(false);
    }, 1000),
    [roomId, socket, isConnected]
  );

  return { sendMessage, sendTypingNotification, sendUserStopTyping };
};
