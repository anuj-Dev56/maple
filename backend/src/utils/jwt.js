import jwt from "jsonwebtoken";

function generateToken(res, id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production", 
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export { generateToken, verifyToken };
