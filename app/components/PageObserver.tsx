import { useChatPanle } from "@/context/ChatPanelContext";
import { ChatResponse } from "@/utils/types";
import axios from "axios";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface ObservedProp {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  roomId: number;
  roomMessages: ChatResponse[];
  setRoomMessage: React.Dispatch<React.SetStateAction<ChatResponse[]>>;
}

export const PageObserver: React.FC<ObservedProp> = ({
  page,
  setPage,
  limit,
  roomId,
  roomMessages,
  setRoomMessage,
}) => {
  const elementRef = useRef(null);
  //
  const handlePagination = useCallback(async () => {
    try {
      if (page > 1) {
        const data = (
          await axios.get(
            `/api/v1/messages?roomId=${roomId}&page=${page}&limit=${limit}`
          )
        ).data as {
          success: boolean;
          message: string;
          chats: ChatResponse[];
        };
        console.log("chats res", data);
        if (data.success && data.chats.length > 0) {
          setRoomMessage((currentMessages) => {
            const updatedMessages = [...currentMessages, ...data.chats];
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.log("pagination error");
    }
  }, [roomId, page]);
  //
  useEffect(() => {
    console.log("current page", page);
    handlePagination();
  }, [page]);
  //
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPage((crnt) => crnt + 1);
            console.log("component in the view");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return <div ref={elementRef} className="w-screen h-[100px] bg-black"></div>;
};
