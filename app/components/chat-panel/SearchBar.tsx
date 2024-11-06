import { useChatPanle } from "@/context/ChatPanelContext";
import { useSearchUsers } from "@/hooks";

import React, { useEffect } from "react";
import { GoSearch } from "react-icons/go";
import { UserInfoCard } from "./UserInfoCard";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSession } from "next-auth/react";

//
interface SearchBarProp {
  className?: string;
  inputProp?: React.Component<HTMLInputElement>;
  onClick: (data: { name: string; id: string; email: string }) => void;
  isGroupChat?: boolean;
}

export const SearchBar: React.FC<SearchBarProp> = (prop) => {
  const { search, setSearch } = useChatPanle();
  const { users, setUsers, searchUsers, searching } = useSearchUsers(
    prop.isGroupChat
  );

  useEffect(() => {
    if (!search) {
      setUsers([]);
    }
  }, [search]);

  // not shoing loged in user while creating group chat

  return (
    <div className="relative w-[95%]">
      {/* input */}
      <div className="w-full h-[40px] flex items-center justify-between gap-[20px] bg-[#1F2C33] rounded-md mt-[20px]">
        <div className="w-[60px] flex justify-center items-center">
          {!search ? (
            <GoSearch className="text-[20px] text-gray-400" />
          ) : (
            <IoIosArrowRoundBack
              onClick={() => {
                setSearch("");
              }}
              className={
                "text-[30px] hover:text-gray-300 text-gray-400 rotate-from-90-0 cursor-pointer"
              }
            />
          )}
        </div>
        <input
          value={search}
          onChange={(e) => {
            e.preventDefault();
            const value = e.target.value;
            // setting search value
            setSearch(value);
            // function to search users
            searchUsers(value);
          }}
          type="text"
          placeholder="Search user by email or name"
          className="w-full bg-transparent outline-none  border-none text-white text-[20px]"
        />
      </div>
      {/* users */}
      {search && (
        <div className="w-full min-h-[50px] absolute flex flex-col justify-center items-center text-white top-[calc(100%+5px)]    bg-[#1F2C33] rounded-md z-10">
          {users.length !== 0 ? (
            users.map(({ id, name, email }) => {
              return (
                <div
                  key={id}
                  onClick={() => {
                    setSearch("");
                    prop.onClick({ id, name, email });
                  }}
                  className="w-full flex flex-col justify-center items-center"
                >
                  <UserInfoCard
                    userId={id}
                    name={name}
                    email={email}
                    isSearchUser={true}
                  />
                </div>
              );
            })
          ) : (
            <>
              {searching ? (
                <div className="w-[30px] h-[30px] border-r-0 border-[1px] border-white animate-spin rounded-full"></div>
              ) : (
                <>No user's found</>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
