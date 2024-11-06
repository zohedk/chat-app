import { useChatPanle } from "@/context/ChatPanelContext";
import { ChatResponse, RoomResponse } from "@/utils/types";
import { ChatRoom, Message } from "@prisma/client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

// this query returns all the chats of loged in user
export function useGetUserChats() {
  const { setRooms } = useChatPanle();
  const query = useQuery({
    queryKey: ["get-user-chat"],
    queryFn: async () => {
      const data = (await axios.get(`/api/v1/room`)).data as RoomResponse;
      if (data.success) {
        setRooms(data.rooms);
      }
      return data;
    },
  });

  return { query, data: query.data };
}

// this query return chats for a particular room
export function useGetRoomChats({
  roomId,
  page,
  limit,
}: {
  roomId?: number;
  page: number;
  limit: number;
}) {
  const { roomMessages, setRoomMessages } = useChatPanle();
  const query = useQuery({
    queryKey: ["get-room-chat"],
    queryFn: async () => {
      if (!roomId) return [];

      const data = (
        await axios.get(
          `/api/v1/messages?roomId=${roomId}&page=${1}&limit=${20}`
        )
      ).data as {
        success: boolean;
        message: string;
        chats: ChatResponse[];
      };
      if (data.success) {
        setRoomMessages(data.chats);
      }
      return data;
    },
  });
  return { query, messages: roomMessages, setMessages: setRoomMessages };
}
//
export function useCreateOneToOneChat() {
  //
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();
  const { setSelectedRoom, setTemporaryRoom } = useChatPanle();
  //
  const mutation = useMutation({
    mutationKey: ["create-room"],
    mutationFn: async ({
      friendId,
      input,
    }: {
      friendId: string;
      input: string;
    }) => {
      if (!sessionData) {
        return toast.error("Not logedIn", { id: "create-room" });
      }

      const data = (
        await axios.post("/api/v1/room", {
          users: [friendId, sessionData.user.userId],
          isGroupChat: false,
        })
      ).data as {
        success: boolean;
        message: string;
        room: ChatRoom;
      };

      if (data.success) {
        const resData = await addMessageToDb(input, data.room.id);
        if (resData?.success) {
          const message = new Audio("/sending-message.mp3");
          await message.play().catch((e) => {
            console.error("Error playing sound:", e);
          });
        }
        setTemporaryRoom(null);
        setSelectedRoom({
          id: data.room.id,
          name: data.room.name || "",
          isGroupChat: data.room.isGroupChat,
        });
        //
        await queryClient.invalidateQueries({ queryKey: ["get-user-chat"] });
      }
      return data;
    },

    onError: (e) => {
      console.log("error", e);
      toast.error("error", { id: "creating-room" });
    },
  });

  return { mutation };
}
//
export function useCreateGroupChat() {
  //
  const { data: sessionData } = useSession();
  const { setSelectedRoom, setSelectedTab } = useChatPanle();
  //
  const mutation = useMutation({
    mutationKey: ["create-room"],
    mutationFn: async ({
      users,
      groupName,
    }: {
      users: string[];
      groupName: string;
    }) => {
      if (!sessionData) {
        return toast.error("Not logedIn", { id: "create-room" });
      }

      const data = (
        await axios.post("/api/v1/room", {
          name: groupName,
          users: [...users, sessionData.user.userId],
          isGroupChat: true,
        })
      ).data as {
        success: boolean;
        message: string;
        room: ChatRoom;
      };

      if (data.success) {
        setSelectedRoom({
          id: data.room.id,
          name: data.room.name || "",
          isGroupChat: data.room.isGroupChat,
        });
        //
        setSelectedTab("chats");
      }
      return data;
    },

    onError: (e) => {
      console.log("error", e);
      toast.error("error creating group", { id: "creating-room" });
    },
  });

  return { mutation };
}
// a simple function to add message
export async function addMessageToDb(input: string, roomId?: number) {
  if (!roomId) {
    return;
  }
  try {
    const data = (
      await axios.post("/api/v1/messages", {
        message: input,
        roomId: roomId,
      })
    ).data as { success: boolean; message: string; createdMessage: Message };

    return data;
  } catch (error) {
    toast.error("unable to add message to db");
  }
}
//
export function useSetUnreadMessage() {
  const { setUnreadMessages, unreadMessages } = useChatPanle();

  function addUnreadMessage({
    messageId,
    roomId,
  }: {
    messageId: string;
    roomId?: string;
  }) {
    if (!roomId) return;
    setUnreadMessages((currenMessages) => {
      const oldMessages = currenMessages[`${roomId}`];
      if (!oldMessages) {
        return { [`${roomId}`]: [messageId] };
      }

      const updatedMessages = {
        ...currenMessages,
        [`${roomId}`]: [...oldMessages, messageId],
      };
      return updatedMessages;
    });
  }
  //
  function removeUnreadMessages(roomId: string) {
    setUnreadMessages((currentMessages) => {
      const oldMessages = currentMessages[`${roomId}`];
      if (!oldMessages) return { ...currentMessages };

      const updatedMessages = { ...currentMessages, [`${roomId}`]: null };
      return updatedMessages;
    });
  }
  //
  async function updateMessageStatus(roomId: number, messageId?: string) {
    try {
      const messages = unreadMessages[`${roomId}`];
      if (messages || messageId) {
        const data = (
          await axios.patch("/api/v1/messages", {
            messages: messageId ? [messageId] : messages,
          })
        ).data as { success: true; message: string };
      }
    } catch (error) {
      console.log("updtin status error", error);
    }
  }
  return { addUnreadMessage, removeUnreadMessages, updateMessageStatus };
}
//
export function useSetLatestMessage() {
  const { setLatestMessages } = useChatPanle();
  //
  function updateLatestMessage(roomId: string, message: ChatResponse) {
    setLatestMessages((currentMessages) => {
      if (message) {
        const updatedMessages = { ...currentMessages, [roomId]: message };
        // console.log("updated message", updatedMessages);
        return updatedMessages;
      }
      return currentMessages;
    });
  }

  return { updateLatestMessage };
}
