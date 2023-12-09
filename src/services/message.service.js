import axios from "axios";
import { url } from "./url";

export default function allMessages(id, token) {
  return axios.get(`${url}/messages/history/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
