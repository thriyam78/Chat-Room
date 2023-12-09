import React, { useState } from "react";
import Button from "../components/signup/Button";
import { toast } from "react-hot-toast";
import registerUser from "../services/auth.service";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const handleNavigate = useNavigate();
  const [input, setInput] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.username || !input.password) {
      toast.error("Please fill all the required fields");
    } else {
      try {
        setIsLoading(true);
        const { data } = await registerUser(input);

        localStorage.setItem("Chat-Room", JSON.stringify(data?.data));
        setIsLoading(false);
        toast.success("User Registered Successfully");
        handleNavigate("/chat");
      } catch (error) {
        setIsLoading(false);
        toast.error(error.response.data.message || "Something went wrong");
        setInput({
          username: "",
          password: "",
        });
      }
    }
  };
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <div className=" flex-col gap-3 w-fit flex mx-auto my-auto">
        <p className="text-3xl font-semibold text-purple-400">
          Welcome to ChatRoom!
        </p>
        <p className="text-2xl text-red-300 text-center">
          Please SignUp to Chat More
        </p>
        <input
          type="text"
          value={input.username}
          onChange={handleChange}
          name="username"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          value={input.password}
          onChange={handleChange}
          className="block w-full rounded-sm p-2 mb-2 border"
        />

        <Button
          className="bg-blue-400 text-black block w-full p-2 rounded-sm"
          handleType="submit"
          isLoading={isLoading}
          text="Register"
          onClick={handleSubmit}
        />
        <p className="text-lg text-black text-center">
          Already Registed User. Please{" "}
          <span
            className="underline text-blue-700 cursor-pointer"
            onClick={() => handleNavigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
