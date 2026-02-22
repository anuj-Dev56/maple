import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    personal: {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      avatar: {
        type: String,
      },
      auth: {
        firebaseUid: {
          type: String,
          default: null,
        },
        googleId: {
          type: String,
          default: null,
        },
      },
    },

    history: [
      {
        id: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        content: {
          link: String,
          data: mongoose.Schema.Types.Mixed,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
