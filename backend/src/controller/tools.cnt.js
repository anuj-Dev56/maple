import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import User from "../schema/auth.schema.js";
import mongoose from "mongoose";

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export async function getYoutubeDetails(videoId) {
  const url = "https://www.googleapis.com/youtube/v3/videos";

  const { data } = await axios.get(url, {
    params: {
      part: "snippet,contentDetails,statistics",
      id: videoId,
      key: process.env.YOUTUBE_API_KEY,
    },
  });

  if (!data.items.length) {
    throw new Error("Video not found");
  }

  const video = data.items[0];

  return {
    title: video.snippet.title,
    description: video.snippet.description,
    channel: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    views: video.statistics.viewCount,
    likes: video.statistics.likeCount,
    thumbnail: video.snippet.thumbnails.high.url,
  };
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export async function Summary(req, res) {
  try {
    const { link } = req.body;
    const id = extractVideoId(link);

    const video = await getYoutubeDetails(id);
    let data;

 const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Summarize the following YouTube video:

Title: ${video.title}

Description:
${video.description}

Duration: ${video.duration}

Return a concise summary in JSON.
`,
            },
          ],
        },
      ],

      generationConfig: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            keyPoints: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["title", "summary", "keyPoints"],
        },
      },
    });

    const match = response.text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON found in Gemini response");
    }

     data = JSON.parse(match);


    res.status(200).json({
      youtube: video,
      data: data
        ? data
        : {
            sumarry: "error",
          },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
}

export async function updateHistory(req, res) {
  console.log(req.body);

  const { history } = req.body;
  const { id } = req.user;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { history } },
      { new: true }
    );

    console.log(history);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "History added successfully",
      history: user.history,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
export async function deleteHistory(req, res) {
  try {
    const { historyId } = req.body;

    if (!historyId) {
      return res.status(400).json({ message: "historyId is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          history: { id: historyId }, 
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "History deleted successfully",
      history: user.history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
