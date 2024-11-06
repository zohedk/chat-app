import { useChatPanle } from "@/context/ChatPanelContext";
import React, { useCallback, useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { SearchBar } from "../chat-panel/SearchBar";
import { useCreateGroupChat } from "@/hooks";
import clsx from "clsx";

const CreateGroup = () => {
  const { setSelectedTab, setSearch } = useChatPanle();
  //
  const [usersToAdd, setUsersToAdd] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  //
  const [usersIdToAdd, setUsersIdToAdd] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    console.log("users to add", usersToAdd);
    console.log("usersIds to add", usersIdToAdd);
  }, [usersToAdd, usersIdToAdd]);

  const { mutation: createGroupChat } = useCreateGroupChat();

  const handleRemoveUser = useCallback((userId: string) => {
    // removing user form users to add state
    setUsersToAdd((currentUsers) => {
      const filteredUser = currentUsers.filter(({ id }) => id !== userId);
      return filteredUser;
    });
    // removing user id from the user's id array state
    setUsersIdToAdd((currentUsers) => {
      const filteredUser = currentUsers.filter((id) => id !== userId);
      return filteredUser;
    });
  }, []);

  return (
    <div className="relative w-[45%] h-full flex flex-col bg-[#111B21] border-l-[1px] border-r-[1px] border-[#ffffff30]">
      <div className="flex items-center gap-[15px] mt-[20px] box-border px-[30px]">
        <IoMdArrowBack
          onClick={() => {
            setSelectedTab("chats");
          }}
          className={
            "text-[30px] hover:text-gray-300 text-gray-400 cursor-pointer"
          }
        />
        <h1 className="text-[20px] text-white font-bold">New Group</h1>
      </div>
      {/* group name */}
      <div className="w-full flex flex-col items-center text-white gap-[7px] mt-[50px]">
        <label
          htmlFor="group-name"
          className="w-[95%] text-[20px] text-white font-bold"
        >
          Group Name:
        </label>
        <input
          className="w-[95%] h-[40px] text-[20px] rounded-md bg-[#1F2C33] outline-none px-[20px]"
          type="text"
          name="group-name"
          id="group-name"
          placeholder="Ex: Family or Office"
          value={groupName}
          onChange={(e) => {
            e.preventDefault();
            setGroupName(e.target.value);
          }}
        />
      </div>
      {/* search bar  */}
      <div className="w-full flex flex-col justify-center items-center mt-[30px]">
        <h1 className="w-[95%] text-[20px] text-white font-bold">Add Users</h1>
        <SearchBar
          isGroupChat={true}
          onClick={({ id, name, email }) => {
            const alreadyInUsersList = usersToAdd.filter(
              (user) => user.id === id
            );
            if (alreadyInUsersList.length === 0) {
              setUsersToAdd((currentUsers) => {
                const updatedUser = [...currentUsers, { id, name, email }];
                return updatedUser;
              });
              //
              setUsersIdToAdd((currentUsers) => {
                const updatedUser = [...currentUsers, id];
                return updatedUser;
              });
            }
          }}
        />
        {/*  */}
        <div className=" w-[95%] flex gap-[10px] flex-wrap mt-[15px]">
          {usersToAdd.map(({ id, name }) => {
            return (
              <div className="relative  h-[30px] flex  items-center gap-[10px] text-[13px] text-white bg-[#1F2C33] hover:bg-[#ffffff0f] px-[10px]">
                {/* remove user button */}
                <button
                  className="absolute top-[1px] right-[5px] text-white text-[14px]"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveUser(id);
                  }}
                >
                  x
                </button>
                <p className="pl-[5px] pr-[10px]"> {name.split(" ")[0]}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* submit button */}
      <div className="absolute bottom-[20px] w-full flex justify-center items-center text-white font-bold ">
        {
          <button
            onClick={() => {
              createGroupChat.mutate({ users: usersIdToAdd, groupName });
            }}
            className={clsx(
              "w-[150px] h-[50px] rounded-md bg-[#04A784] hover:bg-[#04a784d2] transition-all duration-300",
              usersToAdd.length > 0 ? "scale-[1]" : "scale-0"
            )}
          >
            Create
          </button>
        }
      </div>
    </div>
  );
};

export default CreateGroup;
