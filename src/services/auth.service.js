import axios from "axios";
import { url } from "./url";

export default function registerUser(data) {
  return axios.post(`${url}/auth/register`, data);
}

export function loginUser(data) {
  return axios.post(`${url}/auth/login`, data);
}

export function getAllUsers() {
  return axios.get(`${url}/auth/allUsers`);
}

export function updatedStatus(status, token) {
  return axios.patch(`${url}/auth/updateUser/${status}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
