import React, { useState } from "react";
import { useAuth } from "../Auth/AuthlayoutWrapper";
import { useData } from "./DataWrapper";
import toast from "react-hot-toast";
import { Preferences } from '@capacitor/preferences';

const HistoryEditPanel = ({ history }) => {
  const { account } = useAuth();
  const { player } = useData();
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete action
  const handleDelete = async () => {
    if (!player || !confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setIsDeleting(true);
      // API call to delete history item
      // const res = await fetch(
      //   `${import.meta.env.VITE_BACKEND_URL}/tools/deleteHistory`,
      //   {
      //     method: "DELETE",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ historyId: player?.id }),
      //     credentials: "include",
      //   }
      // );

      const result = await Preferences.get({ key: "token" });
      const token = result.value;

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tools/deleteHistory`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ historyId: player?.id }),
          credentials: "include",
        }
      );

      if (res.status !== 200) {
        throw new Error("Failed to delete history item");
      }

      // Redirect to dashboard
      window.location.href = "/app/dashboard";
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete history item");
    } finally {
      setIsDeleting(false);
    }
  };

  const baseExportData = () => ({
    title: player.youtube?.title,
    channel: player.youtube?.channel,
    url: player.url,
    metadata: player.youtube,
    chats: player.chats,
    exportedAt: new Date().toISOString(),
  });

  const downloadBlob = (content, mime, filename) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format) => {
    if (!player) return;

    const data = baseExportData();
    const title = player.youtube?.title || "video";

    switch (format) {
      case "json": {
        downloadBlob(
          JSON.stringify(data, null, 2),
          "application/json",
          `${title}-export.json`
        );
        break;
      }
      case "txt": {
        const text = `Title: ${data.title}\nChannel: ${data.channel}\nURL: ${
          data.url
        }\nDate: ${data.exportedAt}\n\nDescription:\n${
          player.youtube?.description || ""
        }\n`;
        downloadBlob(text, "text/plain", `${title}-export.txt`);
        break;
      }
      case "html": {
        const html = `<!doctype html><html><head><meta charset='utf-8'><title>${
          data.title
        }</title></head><body><h1>${
          data.title
        }</h1><p><strong>Channel:</strong> ${
          data.channel
        }</p><p><strong>URL:</strong> <a href='${data.url}'>${
          data.url
        }</a></p><p><strong>Exported:</strong> ${data.exportedAt}</p><pre>${
          player.youtube?.description || ""
        }</pre></body></html>`;
        downloadBlob(html, "text/html", `${title}-export.html`);
        break;
      }
      case "js": {
        const js = `export const videoData = ${JSON.stringify(data, null, 2)};`;
        downloadBlob(js, "application/javascript", `${title}-export.js`);
        break;
      }
      case "pdf": {
        const text = `Video: ${data.title}\nChannel: ${data.channel}\nURL: ${data.url}\nDate: ${data.exportedAt}`;
        downloadBlob(text, "application/pdf", `${title}-export.pdf`);
        break;
      }
      case "drive": {
        toast("Drive export not yet wired. Connect API to enable.");
        break;
      }
      default:
        downloadBlob(
          JSON.stringify(data, null, 2),
          "application/json",
          `${title}-export.json`
        );
    }
  };

  // Handle share action
  const handleShare = () => {
    if (!player?.url) return;

    if (navigator.share) {
      navigator
        .share({
          title: player.youtube?.title || "Check this out",
          text: player.youtube?.description || "",
          url: player.url,
          thambnail: player.youtube?.thambnail || "",
        })
        .catch((err) => console.log("Share failed:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(player.url).then(() => {
        toast.success("Link copied to clipboard!");
      });
    }
  };

  if (!player) return null;

  return (
    <div className="w-full flex flex-col gap-3 p-3 sm:p-4 bg-zinc-900/60 border border-zinc-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-200">Actions</h3>
        <span className="text-xs text-zinc-500">Quick tools</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 w-full">
        {/* Share Button - Full width on mobile */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs sm:text-sm border border-zinc-700"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>

        {/* Export Buttons - Responsive Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleExport("json")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>JSON</span>
          </button>
          <button
            onClick={() => handleExport("txt")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>TXT</span>
          </button>
          <button
            onClick={() => handleExport("html")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>HTML</span>
          </button>
          <button
            onClick={() => handleExport("js")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>JS</span>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExport("drive")}
            className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors text-xs border border-zinc-700"
          >
            <span>Drive</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-700 my-1"></div>

        {/* Delete Button - Full width on mobile */}
        <button
          onClick={handleDelete}
          disabled={isDeleting || player?.id == undefined}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-md transition-colors text-xs sm:text-sm border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {!player?.id
                ? "Select from sidebar History"
                : "Delete from History"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HistoryEditPanel;
