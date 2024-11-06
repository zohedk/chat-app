import { ChatPanelContextProp, Room } from "@/context/ChatPanelContext";

interface handleUserInfoOnClickProp {
  setSelectedUser: ChatPanelContextProp["setSelectedUser"];
  setSelectedRoom: ChatPanelContextProp["setSelectedRoom"];
  selectedRoom: ChatPanelContextProp["selectedRoom"];
  setTemporaryRoom: ChatPanelContextProp["setTemporaryRoom"];
  friendId: string;
  friendName: string;
  friendEmail: string;
}
// handle userInfoCard onClick
export const handleUserInfoOnClick = (
  prop: Room,
  {
    setSelectedUser,
    setSelectedRoom,
    selectedRoom,
    setTemporaryRoom,
    friendId,
    friendEmail,
    friendName,
  }: handleUserInfoOnClickProp
) => {
  // setting temporary room to null
  setTemporaryRoom(null);
  // if room is selected return

  if (prop.id === selectedRoom?.id) {
    return;
  }
  // if group chat
  if (prop.isGroupChat && prop.id) {
    setSelectedRoom({
      id: prop.id,
      isGroupChat: true,
      name: prop.name!,
    });
    setSelectedUser(null);
  }
  // if not group chat
  if (!prop.isGroupChat && prop.id) {
    setSelectedUser({
      id: friendId,
      name: friendName,
      email: friendEmail,
    });
    setSelectedRoom({
      id: prop.id,
      isGroupChat: false,
      name: "",
    });
  }
};
