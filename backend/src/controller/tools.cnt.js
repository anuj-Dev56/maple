import {GoogleGenAI} from "@google/genai";
import User from "../schema/auth.schema.js";


function extractVideoId(url) {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

export async function getYoutubeDetails(videoId) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.append("part", "snippet,contentDetails,statistics");
    url.searchParams.append("id", videoId);
    url.searchParams.append("key", process.env.YOUTUBE_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

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

const token = process.env.GEMINI_API_KEY;

console.log(token);

const ai = new GoogleGenAI({
    apiKey: "AIzaSyBIezPGOnR1GVG3oda4uB7uoTC-wVBPKoA",
});

export async function Summary(req, res) {
    try {
        const {link} = req.body;

        const user = await User.findById(req.user.id);

        if (!link) {
            return res.status(400).json({error: "Link is required"});
        }

        // Protector: Check if video already exists in user's history
        if (user?.history && user.history.length > 0) {
            const existingVideo = user.history.find(
                (item) => item?.content?.link === link
            );

            if (existingVideo) {
                return res.status(400).json({
                    error: "Video already exists in your history",
                    exists: true,
                    data: existingVideo?.content?.data
                });
            }
        }

        const id = extractVideoId(link);

        if (!id) {
            return res.status(400).json({error: "Invalid YouTube URL"});
        }

        const video = await getYoutubeDetails(id);

        if (video.title === undefined) {
            return res.status(404).json({error: "Video not found"});
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
Summarize the following YouTube video and provide key topics and target audience:

Title: ${video.title}

Description:
${video.description}

Duration: ${video.duration}

Return a detailed JSON with:
- title: Video title
- summary: Concise summary
- keyPoints: Array of key points
- key_topics: Array of main topics covered in the video
- target_audience: Who this video is intended for
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
                        title: {type: "string"},
                        summary: {type: "string"},
                        keyPoints: {
                            type: "array",
                            items: {type: "string"},
                        },
                        key_topics: {
                            type: "array",
                            items: {type: "string"},
                            description: "Main topics covered in the video"
                        },
                        target_audience: {
                            type: "string",
                            description: "Intended audience for this video"
                        }
                    },
                    required: ["title", "summary", "keyPoints", "key_topics", "target_audience"],
                },
            },
        });

        let data = null;

        if (response && response.candidates && response.candidates[0]) {
            const content = response.candidates[0].content;
            if (content && content.parts && content.parts[0]) {
                const text = content.parts[0].text;
                const match = text.match(/\{[\s\S]*}/);
                if (match) {
                    data = JSON.parse(match[0]);
                }
            }
        }

        res.status(200).json({
            youtube: video,
            data: data || {
                title: video.title,
                summary: "Unable to generate summary",
                keyPoints: [],
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to generate summary", details: error.message});
    }
}

export async function updateHistory(req, res) {
    console.log(req.body);

    const {history} = req.body;
    const {id} = req.user;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {$push: {history}},
            {new: true}
        );

        console.log(history);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({
            message: "History added successfully",
            history: user.history,
        });
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}

export async function deleteHistory(req, res) {
    try {
        const {historyId} = req.body;

        if (!historyId) {
            return res.status(400).json({message: "historyId is required"});
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $pull: {
                    history: {id: historyId},
                },
            },
            {new: true}
        );

        if (!user) {
            return res.status(404).json({message: "User not found"});
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
