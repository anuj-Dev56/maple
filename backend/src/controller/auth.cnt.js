import mongoose from "mongoose";
import User from "../schema/auth.schema.js";
import { generateToken } from "../utils/jwt.js";
import { verifyGoogleToken } from "../utils/google.js";
import { uploadGoogleAvatar } from "../utils/upload.js";

function generateUserName(name = "") {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}${random}`;
}

const register = async (req, res) => {
  try {
    const { email, name: Name } = req.body;

    const existingUser = await User.findOne({
      "personal.email": email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    let username;
    let exists = true;

    while (exists) {
      username = generateUserName(Name);
      exists = await User.exists({
        "personal.username": username,
      });
    }

    const user = await User.create({
      personal: {
        email,
        username,
      },
    });

    generateToken(res, user._id);

    user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const signout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // expire immediately
    path: "/", // match path used in login
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const googleAuthCnt = async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleToken(idToken);

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ "personal.auth.googleId": sub });
    const username = generateUserName(name);

    // const avatarUrl = await uploadGoogleAvatar(picture);

    if (!user) {
      user = await User.create({
        personal: {
          email,
          username,
          avatar: picture,
          auth: {
            googleId: sub,
          },
        },
      });
    }

    const token = generateToken(res, user._id);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const findUser = await User.findById(req.user.id);
    let user = findUser;
    if (user != undefined || user !== null) {
      return res.status(200).json({
        user: user,
      });
    } else {
      return res.status(201).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* const login = async (req, res) => {
  try {
    const { email } = req.body;

    const isUserExits = await User.findOne({
      "personal.email": email,
    });

    if (isUserExits) {
      return res.status(400).json({
        message: "user with this email found",
      });

    
    } else {

    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
}; */

export default register;
