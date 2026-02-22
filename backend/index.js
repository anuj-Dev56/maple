import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import Auth from "./src/routes/auth.route.js";
import connectDB from "./src/utils/mongoose.js";
import cookieParser from "cookie-parser";
import Tool from "./src/routes/tool.route.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

connectDB();

app.use("/api/auth", Auth);
app.use("/tools", Tool);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./error.html"));
});

app.listen(process.env.PORT, (e) => {
  console.log("Maple server started on ", process.env.PORT);
});
