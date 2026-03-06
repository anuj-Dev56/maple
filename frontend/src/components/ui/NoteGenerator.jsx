import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "./DataWrapper";
import user from "../../utils/user.js";

function getHistoryIndex(id) {
  if (!user.user?.history) return -1;
  return user.user.history.findIndex((h) => h.id === id);
}

const NoteGenerator = () => {
  const { player } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get actual data from history
  const getVideoData = () => {
    if (!player) return null;

    const historyIndex = getHistoryIndex(player.id);
    if (historyIndex === -1) return null;

    const historyItem = user.user.history[historyIndex];
    const videoData = historyItem?.content?.data?.data || {};

    return {
      title: videoData.title || player.youtube?.title || "Video Notes",
      summary: videoData.summary || "No summary available.",
      keyPoints: videoData.keyPoints || [],
      key_topics: videoData.key_topics || [],
      target_audience: videoData.target_audience || "General Audience",
      channel: player.youtube?.channel || "Unknown Channel",
      duration: player.youtube?.duration || "Unknown"
    };
  };

  const generationSteps = [
    "Analyzing video content...",
    "Extracting key points...",
    "Organizing information...",
    "Generating structured notes...",
    "Finalizing document..."
  ];

  const startGeneration = () => {
    const videoData = getVideoData();
    if (!videoData) return;

    setIsGenerating(true);
    setProgress(0);
    setGeneratedNotes(null);

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      // Update step message
      const stepProgress = Math.floor((currentProgress / 100) * generationSteps.length);
      if (stepProgress < generationSteps.length) {
        setCurrentStep(generationSteps[stepProgress]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);

          // Create notes from real data
          const notes = {
            title: videoData.title,
            channel: videoData.channel,
            duration: videoData.duration,
            sections: [
              {
                heading: "Summary",
                content: videoData.summary
              },
              ...(videoData.keyPoints && videoData.keyPoints.length > 0 ? [{
                heading: "Key Points",
                points: videoData.keyPoints
              }] : []),
              ...(videoData.key_topics && videoData.key_topics.length > 0 ? [{
                heading: "Topics Covered",
                points: videoData.key_topics
              }] : []),
              {
                heading: "Target Audience",
                content: videoData.target_audience
              }
            ],
            timestamp: new Date().toLocaleString()
          };

          setGeneratedNotes(notes);
          setCurrentStep("Notes generated successfully!");
        }, 500);
      }
    }, 100);
  };

  const resetNotes = () => {
    setGeneratedNotes(null);
    setProgress(0);
    setCurrentStep("");
  };

  // Export functions
  const buildNotesText = () => {
    if (!generatedNotes) return "";

    let notesText = `${generatedNotes.title}\n`;
    notesText += `Channel: ${generatedNotes.channel} | Duration: ${generatedNotes.duration}\n`;
    notesText += `Generated: ${generatedNotes.timestamp}\n\n`;

    generatedNotes.sections.forEach((section) => {
      notesText += `${section.heading}\n`;
      notesText += `${"=".repeat(section.heading.length)}\n`;

      if (section.content) {
        notesText += `${section.content}\n\n`;
      }

      if (section.points && section.points.length > 0) {
        section.points.forEach((point) => {
          notesText += `• ${point}\n`;
        });
        notesText += `\n`;
      }
    });

    return notesText;
  };

  const exportAsTXT = () => {
    const text = buildNotesText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${generatedNotes.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsJSON = () => {
    const jsonData = JSON.stringify(generatedNotes, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${generatedNotes.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${generatedNotes.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
          h2 { color: #5b21b6; margin-top: 30px; border-left: 4px solid #7c3aed; padding-left: 15px; }
          p { line-height: 1.6; }
          ul { line-height: 1.8; }
          li { margin-bottom: 8px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${generatedNotes.title}</h1>
        <div class="meta">
          <strong>Channel:</strong> ${generatedNotes.channel} | 
          <strong>Duration:</strong> ${generatedNotes.duration}<br>
          <strong>Generated:</strong> ${generatedNotes.timestamp}
        </div>
        ${generatedNotes.sections.map(section => `
          <h2>${section.heading}</h2>
          ${section.content ? `<p>${section.content}</p>` : ''}
          ${section.points && section.points.length > 0 ? `
            <ul>
              ${section.points.map(point => `<li>${point}</li>`).join('')}
            </ul>
          ` : ''}
        `).join('')}
        <div class="footer">
          Generated by Maple - Video Note Generator
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (user can cancel)
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };

    setShowExportMenu(false);
  };

  const copyToClipboard = () => {
    const text = buildNotesText();
    navigator.clipboard.writeText(text);
    alert("Notes copied to clipboard!");
  };

  return (
    <div className="w-full bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/50 p-4 lg:p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Note Generator
        </h2>

        {generatedNotes && (
          <button
            onClick={resetNotes}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Generate Button */}
      {!generatedNotes && !isGenerating && (
        <motion.button
          onClick={startGeneration}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 lg:py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg
            className="w-4 h-4 lg:w-5 lg:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-sm lg:text-base">Generate Notes</span>
        </motion.button>
      )}

      {/* Generation Progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 lg:space-y-4"
          >
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs lg:text-sm">
                <span className="text-zinc-400">{currentStep}</span>
                <span className="text-purple-400 font-semibold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 lg:h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Loading Animation */}
            <div className="flex items-center justify-center py-6 lg:py-8">
              <div className="relative">
                <motion.div
                  className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 border-4 border-blue-600/30 border-b-blue-600 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Notes */}
      <AnimatePresence>
        {generatedNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3 lg:space-y-4"
          >
            {/* Success Message */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5 lg:p-3 flex items-center gap-2 text-green-400 text-xs lg:text-sm"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {currentStep}
            </motion.div>

            {/* Notes Content */}
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-lg p-3 lg:p-4 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto custom-scrollbar border border-zinc-700/50">
              <div className="space-y-3 lg:space-y-4">
                {/* Title */}
                <div className="border-b border-zinc-700/50 pb-2 lg:pb-3">
                  <h3 className="text-sm lg:text-base font-bold text-white mb-1 line-clamp-2">
                    {generatedNotes.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 lg:gap-2 text-[10px] lg:text-xs text-zinc-500">
                    <span className="truncate max-w-[120px]">{generatedNotes.channel}</span>
                    <span>•</span>
                    <span>{generatedNotes.duration}</span>
                    <span className="hidden lg:inline">•</span>
                    <span className="hidden lg:inline text-[10px]">{generatedNotes.timestamp}</span>
                  </div>
                </div>

                {/* Sections */}
                {generatedNotes.sections.map((section, sectionIdx) => (
                  <motion.div
                    key={sectionIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIdx * 0.1 }}
                    className="space-y-1.5 lg:space-y-2"
                  >
                    <h4 className="text-xs lg:text-sm font-semibold text-purple-400 flex items-center gap-1.5 lg:gap-2">
                      <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
                      {section.heading}
                    </h4>

                    {/* For content-based sections (like Summary) */}
                    {section.content && (
                      <p className="text-zinc-300 text-[11px] lg:text-xs leading-relaxed ml-2.5 lg:ml-3.5">
                        {section.content}
                      </p>
                    )}

                    {/* For points-based sections (like Key Points) */}
                    {section.points && section.points.length > 0 && (
                      <ul className="space-y-1 lg:space-y-1.5 ml-2.5 lg:ml-3.5">
                        {section.points.map((point, pointIdx) => (
                          <motion.li
                            key={pointIdx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: sectionIdx * 0.1 + pointIdx * 0.05 }}
                            className="text-zinc-300 text-[11px] lg:text-xs flex items-start gap-1.5 lg:gap-2"
                          >
                            <span className="text-blue-500 mt-0.5 flex-shrink-0 text-xs">•</span>
                            <span className="break-words">{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={startGeneration}
                className="flex-1 bg-zinc-800 text-white py-2 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>

              <button
                onClick={copyToClipboard}
                className="flex-1 bg-zinc-800 text-white py-2 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>

              {/* Export Dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                  <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Export Menu Dropdown */}
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <button
                        onClick={exportAsTXT}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <div className="font-medium">Export as TXT</div>
                          <div className="text-xs text-zinc-400">Plain text format</div>
                        </div>
                      </button>

                      <button
                        onClick={exportAsJSON}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <div>
                          <div className="font-medium">Export as JSON</div>
                          <div className="text-xs text-zinc-400">Structured data format</div>
                        </div>
                      </button>

                      <button
                        onClick={exportAsPDF}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-700 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <div className="font-medium">Export as PDF</div>
                          <div className="text-xs text-zinc-400">Print-ready document</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
};

export default NoteGenerator;
