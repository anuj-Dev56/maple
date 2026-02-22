import React, {useEffect, useState} from "react";
import {useAuth} from "../components/Auth/AuthlayoutWrapper";
import {useParams} from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Player from "../components/player/Player";
import New from "../components/player/New";
import {useData} from "../components/ui/DataWrapper";
import Chat from "../components/ui/Chat";
import AuthPanel from "../components/Auth/Auth.layout";
import AuthBtn from "../components/Auth/AuthBtn";
import HistoryEditPanel from "../components/ui/HistoryEditPanel";
import FlowBook from "../components/ui/FlowBook";
import Chart from "../components/ui/Chart";

const Dashboard = ({type}) => {
    const {account} = useAuth();
    const {progress, setProgress, setPlayer} = useData();
    const {id} = useParams();

    useEffect(() => {
        if (account?.history) {
            // Find the history item with matching ID
            const historyItem = account.history.find((h) => h.id === id);

            if (historyItem && historyItem.content) {
                // Extract YouTube data from history content
                const youtubeData = historyItem?.content || {};

                // Get URL from various possible locations
                let videoUrl =
                    youtubeData.url ||
                    youtubeData.videoUrl ||
                    youtubeData.link ||
                    historyItem.content?.data?.url;

                // If we have a video ID but no URL, construct the YouTube URL
                if (!videoUrl && youtubeData.videoId) {
                    videoUrl = `https://www.youtube.com/watch?v=${youtubeData.videoId}`;
                }

                // If we have a title and it looks like YouTube content, try to construct from context
                if (!videoUrl && youtubeData.title) {
                    // This is a fallback - in production you'd want the actual URL from backend
                    console.log("No URL found for:", youtubeData.title);
                }

                setPlayer({
                    url: videoUrl,
                    id: historyItem.id,
                    youtube: {
                        title: youtubeData.data.youtube.title,
                        channel: youtubeData.data.youtube.channel,
                        duration: youtubeData.data.youtube.duration,
                        views: youtubeData.data.youtube.views,
                        likes: youtubeData.data.youtube.likes,
                        thumbnail: youtubeData.data.youtube.thumbnail,
                        description: youtubeData.data.youtube.description,
                        publishedAt: youtubeData.data.youtube.publishedAt,
                    },
                    chats: historyItem.chats || [],
                });

                // Set progress to show player instead of new
                setProgress("loaded");
            }
        }
    }, [id, account?.history, setPlayer, setProgress]);

    // Render auth screen if not authenticated
    const authScreen = (
        <div className="w-full items-center flex flex-col gap-4 justify-center h-screen">
            <h1>Can't Start Without Account ?</h1>
            <AuthBtn/>
        </div>
    );

    // Render new content screen
    const newScreen = (
        <div className="flex flex-row">
            <New/>
        </div>
    );

    // Render player and chat screen
    const playerScreen = (
        <div className="flex flex-col">
            <Player/>
            {/* Chat Summary - Mobile Friendly */}
            <div className="w-full max-h-[50vh] sm:max-h-[60vh] lg:max-h-[65vh]">
                <Chat/>
            </div>
        </div>
    );

    const Chartdata = {
        labels: ["Comedy", "Reaction", "Informational"],
        datasets: [
            {
                label: "Inrest",
                data: [20, 10, 70],
                backgroundColor: [
                    "rgb(133, 105, 241)",
                    "rgb(164, 101, 241)",
                    "rgb(101, 143, 241)",
                ],
                hoverOffset: 4,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-zinc-950 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-2 w-full">
                {/* Sidebar - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex flex-shrink-0">
                    <Sidebar/>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-2 lg:gap-3 p-2 sm:p-3 lg:p-3">
                    {/* Player Section */}
                    <div className="flex-1 min-w-0">
                        {!account
                            ? authScreen
                            : progress === "new"
                                ? newScreen
                                : playerScreen}
                    </div>

                    {/* Right Sidebar - Responsive Layout */}
                    {progress !== "new" && (
                        <div className="w-full lg:w-80 xl:w-[420px] flex-shrink-0 flex flex-col gap-2 lg:gap-3">
                            {/* Mobile-optimized sections */}
                            <div className="space-y-2 lg:space-y-3">
                                {/* History Edit Panel - Mobile Friendly */}
                                <div className="w-full">
                                    <HistoryEditPanel/>
                                </div>

                                {/* Chart - Mobile Friendly */}
                                <div className="w-full rounded-lg overflow-hidden border-2 border-white/10">
                                    <div
                                        className="py-2 sm:py-3 px-3 sm:px-4 bg-white/10 rounded text-xs sm:text-sm font-medium">
                                        Interest Level
                                    </div>
                                    <Chart data={Chartdata}/>
                                </div>

                                {/* FlowBook - Full width on mobile, responsive */}
                                <div className="w-full">
                                    <FlowBook/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
