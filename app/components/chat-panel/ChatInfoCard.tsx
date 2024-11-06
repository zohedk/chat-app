import { RoomResponse } from "@/utils/types";
import React from "react";

interface ChatInfoCardProp {
  userId: string;
  name: string;
  roomId: number;
  latestMessage: string;
}

const ChatInfoCard: React.FC<ChatInfoCardProp> = () => {
  return (
    <div className="w-full h-[] flex items-center justify-between">
      {/* pi */}
    </div>
  );
};

export default ChatInfoCard;
