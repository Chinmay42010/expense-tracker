import axios from "axios";

const api = axios.create({
  baseURL: "https://expense-tracker-6cjv.onrender.com/api",
});

export default api;
