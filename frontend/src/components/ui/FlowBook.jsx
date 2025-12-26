import React from "react";

// Minimal placeholder for the future FlowBook tool.
// Toggle this on when the FlowBook project is ready.
const FlowBook = () => {
  return (
    <div className="p-3 w-[200] rounded-lg border border-dashed border-zinc-700 text-zinc-200 bg-zinc-900/50">
      <h2 className="text-lg font-semibold mb-2">FlowBook</h2>
      <p className="text-sm text-zinc-400 mb-3">FlowBook flowchart builder.</p>
      <div className="flex flex-col justify-center items-start gap-2">
        <button
          className="px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-not-allowed"
          disabled
        >
          FlowBook Tool
        </button>
        <p className="text-sm text-center text-zinc-400 mb-3">Coming soon </p>
      </div>
    </div>
  );
};

export default FlowBook;
