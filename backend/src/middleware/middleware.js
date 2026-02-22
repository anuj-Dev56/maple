import { log } from "console";
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1]; // Bearer TOKE

    log(token)

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
