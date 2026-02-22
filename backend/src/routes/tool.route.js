import express from "express";
import { deleteHistory, Summary, updateHistory } from "../controller/tools.cnt.js";
import authMiddleware from "../middleware/middleware.js"
import middleware from "../middleware/middleware.js";
const route = express.Router();

route.post("/summary", authMiddleware ,Summary);
route.post("/updateHistory", authMiddleware , updateHistory);
route.delete("/deleteHistory", authMiddleware, deleteHistory)

export default route;
