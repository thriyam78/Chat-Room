/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import { set, uniqBy } from "lodash";
import { toast } from "react-hot-toast";
import allMessages from "../services/message.service";
import { getAllUsers, updatedStatus } from "../services/auth.service";
import Contact from "../components/users/Contact";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../services/url";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { user, token } = JSON.parse(localStorage.getItem("Chat-Room") || "");
  const username = user.username;
  const userId = user._id;
  const [newMessageText, setNewMessageText] = useState("");
  const [showMessages, setShowMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [status, setStatus] = useState("active");
  const [isAvailable, setIsAvailable] = useState(false);
  const ref = useRef();
  const handleNavigate = useNavigate();
  useEffect(() => {
    connectToWS();
  }, []);
  function connectToWS() {
    const { token } = JSON.parse(localStorage.getItem("Chat-Room") || "");

    const ws = new WebSocket(
      `wss://chat-room-api-v1.onrender.com?token=${token}`
    );
    setWs(ws);

    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () =>
      setTimeout(() => {
        toast.error("Disconnected.Trying to Reconnect Again");
        connectToWS();
      })
    );
  }

  function showOnlineFunction(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);

    if ("online" in messageData) {
      showOnlineFunction(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setShowMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };
  const statusActive = async () => {
    setIsAvailable(false);
    setStatus("active");
    const { data } = await updatedStatus("inactive", token);

    // localStorage.setItem("Chat-Room", JSON.stringify(data?.data));
    toast.success("Status Updated successfully");
  };
  const statusInactive = async () => {
    setIsAvailable(true);
    setStatus("inactive");
    const { data } = await updatedStatus("active", token);

    // localStorage.setItem("Chat-Room", JSON.stringify(data?.data));
    toast.success("Status Updated successfully");
  };
  const onlinePeopleExculdeUser = { ...onlinePeople };
  delete onlinePeopleExculdeUser[userId];
  const sendMessaage = async (e, file = null) => {
    if (e) e.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    setNewMessageText("");
    setShowMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: userId,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    if (file) {
      const { token } = JSON.parse(localStorage.getItem("Chat-Room"));

      if (selectedUserId) {
        const historyData = await allMessages(selectedUserId, token);
        setShowMessages(historyData?.data || []);
      }
    }
  };
  const sendFile = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      const base64Data = reader.result.replace(/^data:.*;base64,/, "");
      sendMessaage(null, {
        name: e.target.files[0].name,
        data: base64Data,
      });
    };
  };
  useEffect(() => {
    const div = ref.current;
    if (div) {
      div.scrollIntoView({ behaviour: "smooth" });
    }
  }, [showMessages]);
  const messageWithOutDupes = uniqBy(showMessages, "_id");

  useEffect(() => {
    const { token } = JSON.parse(localStorage.getItem("Chat-Room"));
    const getMessages = async () => {
      if (selectedUserId) {
        const historyData = await allMessages(selectedUserId, token);
        setShowMessages(historyData?.data || []);
      }
    };
    getMessages();
    return () => {};
  }, [selectedUserId]);

  const handleLogOut = () => {
    toast.success("Logged Out Successfully");

    handleNavigate("/");
    const removeLocalStorage = localStorage.removeItem("Chat-Room");
  };

  useEffect(() => {
    const AllUsers = async () => {
      const allUsers = await getAllUsers();
      const allPeople = allUsers?.data?.allUsers;
      const offlinePeopleArr = allPeople.filter(
        (p) => !Object.keys(onlinePeople).includes(p._id)
      );
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => (offlinePeople[p._id] = p));
      setOfflinePeople(offlinePeople);
    };
    AllUsers();
    return () => {};
  }, [onlinePeople]);

  return (
    <div className="flex h-screen">
      <div className="bg-blue-50 w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />

          {Object.keys(onlinePeopleExculdeUser).map((userId) => (
            <Contact
              key={userId}
              userId={userId}
              online={true}
              username={onlinePeopleExculdeUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              userId={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center  flex items-center justify-center ">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            {username}
          </span>
          <div className="bg-blue-200 rounded-lg p-2 mr-4 cursor-pointer">
            {isAvailable ? (
              <div
                onClick={() => statusActive()}
                className=" flex items-center gap-2 "
              >
                <div className="w-3 h-3 border-0 border-white shadow-sm shadow-black bg-green-500 rounded-full "></div>
                <p className="text-gray-600">Active</p>
              </div>
            ) : (
              <div
                onClick={() => statusInactive()}
                className="flex items-center gap-2"
              >
                <div className="w-3 h-3 border-0 border-white shadow-sm shadow-black bg-red-500 rounded-full "></div>
                <p className="text-gray-600">Inactive</p>
              </div>
            )}
          </div>

          <button
            className=" text-gray-600 bg-blue-100 p-2 border rounded-lg "
            onClick={handleLogOut}
          >
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messageWithOutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === userId ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2 rounded-md text-sm " +
                        (message.sender === userId
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
                      {message.text}
                      {message.file && (
                        <div className="">
                          <a
                            target="_blank"
                            className="flex items-center gap-1 border-b"
                            href={baseUrl + "/uploads/" + message.file}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div ref={ref}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessaage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-sm p-2"
            />
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
