import React from "react";

export default function Avatar({ username, userId, online }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-violet-200",
    "bg-yellow-200",
    "bg-teal-200",
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;

  const color = colors[colorIndex];
  const displayText = username ? username[0] : "";

  return displayText === "" ? null : (
    <div
      className={
        "w-10 h-10 relative rounded-full text-center flex items-center  " +
        color
      }
    >
      <div className="text-center w-full opacity-70 p-2 text-xl">
        {displayText}
      </div>
      {online && (
        <div className="absolute w-3 h-3 border-0 border-white shadow-sm shadow-black bg-green-500 bottom-0 right-0 rounded-full"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 border-0 border-white shadow-sm shadow-black bg-gray-500 bottom-0 right-0 rounded-full"></div>
      )}
    </div>
  );
}
