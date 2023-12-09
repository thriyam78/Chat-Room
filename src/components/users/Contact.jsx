import React from "react";
import Avatar from "../Avatar";

export default function Contact({
  userId,
  username,
  onClick,
  selected,
  online,
}) {
  return (
    <div
      key={userId}
      onClick={() => onClick(userId)}
      className={
        "border-b border-gray-300 text-2xl flex items-center gap-3 cursor-pointer " +
        (selected ? "bg-blue-200 rounded-r-md" : "")
      }
    >
      {selected && <div className="w-1 bg-black h-12"></div>}
      <div className=" py-2 pl-4 flex items-center gap-3 ">
        <Avatar online={online} username={username} userId={userId} />
        {username}
      </div>
    </div>
  );
}
