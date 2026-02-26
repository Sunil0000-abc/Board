import axios from "axios";

const API = axios.create({
  baseURL: "/api/posts",
});

export const getPosts = () => API.get("/");
export const createPost = (data) => API.post("/", data);