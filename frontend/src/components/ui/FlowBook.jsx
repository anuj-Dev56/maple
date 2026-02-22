import React, { useState, useRef, useEffect } from "react";
import mermaid from "mermaid";
import toast from "react-hot-toast";

const defaultDiagrams = {
  flowchart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,

  tree: `graph TD
    A[Root Project]
    A --> B[Frontend]
    A --> C[Backend]
    A --> D[Database]
    B --> B1[React]
    B --> B2[Tailwind]
    C --> C1[Node.js]
    C --> C2[API]
    D --> D1[MongoDB]
    D --> D2[Redis]`,

  sequence: `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    User->>Frontend: Click Button
    Frontend->>Backend: Send Request
    Backend->>Database: Query Data
    Database-->>Backend: Return Data
    Backend-->>Frontend: Send Response
    Frontend-->>User: Display Result`,
};

const diagramTabs = [
  { key: "flowchart", label: "Flowchart" },
  { key: "tree", label: "Tree" },
  { key: "sequence", label: "Sequence" },
];

const FlowBook = () => {
  const [activeTab, setActiveTab] = useState("flowchart");
  const [diagramCode, setDiagramCode] = useState(defaultDiagrams.flowchart);
  const [diagramOutput, setDiagramOutput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const mermaidRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: "dark" });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramCode.trim()) return;
      try {
        const { svg } = await mermaid.render("diagram", diagramCode);
        setDiagramOutput(svg);
      } catch {
        setDiagramOutput("");
        toast.error("Invalid Mermaid syntax");
      }
    };
    renderDiagram();
  }, [diagramCode]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDiagramCode(defaultDiagrams[tab]);
    setIsEditing(false);
  };

  const downloadSVG = () => {
    if (!diagramOutput) {
      toast.error("No diagram to download");
      return;
    }
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(diagramOutput)
    );
    element.setAttribute("download", `flowbook-${activeTab}.svg`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Diagram downloaded!");
  };

  const downloadPNG = async () => {
    if (!mermaidRef.current) {
      toast.error("No diagram to download");
      return;
    }
    try {
      const svg = mermaidRef.current.querySelector("svg");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "rgba(24, 24, 27, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `flowbook-${activeTab}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
          toast.success("PNG downloaded!");
        });
      };
      img.src = url;
    } catch {
      toast.error("Failed to download PNG");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(diagramCode);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flowbook-panel w-full h-full flex flex-col flex-1 bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-900 rounded-lg border border-zinc-700 overflow-hidden min-h-[300px] max-h-full">
      <div className="p-2 sm:p-4 md:p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            FlowBook
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Create flowcharts, tree graphs, and sequence diagrams
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
          {diagramTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Layout - Responsive, take all available space */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0">
          {/* Editor Section */}
          <div className="flex flex-col bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden min-h-[200px] max-h-full">
            <div className="bg-zinc-900 border-b border-zinc-700 p-2 sm:p-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Mermaid Code
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2 sm:px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded text-xs transition-colors"
              >
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-3">
              {isEditing ? (
                <textarea
                  value={diagramCode}
                  onChange={(e) => setDiagramCode(e.target.value)}
                  className="w-full h-40 sm:h-56 font-mono text-xs sm:text-sm bg-zinc-900 text-zinc-200 border border-zinc-600 rounded p-2 focus:outline-none focus:border-purple-500 resize-none"
                  spellCheck="false"
                />
              ) : (
                <pre className="text-zinc-300 font-mono text-xs whitespace-pre-wrap break-words max-h-56 overflow-auto">
                  {diagramCode}
                </pre>
              )}
            </div>

            <div className="bg-zinc-900 border-t border-zinc-700 p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyCode}
                className="flex-1 px-2 sm:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors font-medium text-xs sm:text-sm"
              >
                Copy Code
              </button>
              <button
                onClick={() => setDiagramCode(defaultDiagrams[activeTab])}
                className="flex-1 px-2 sm:px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors font-medium text-xs sm:text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden min-h-[200px] max-h-full">
            <div className="bg-zinc-900 border-b border-zinc-700 p-2 sm:p-3">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Preview
              </h2>
            </div>

            <div
              ref={mermaidRef}
              className="flex-1 overflow-auto p-2 sm:p-3 bg-zinc-900/50 flex items-center justify-center min-h-[200px] sm:min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: diagramOutput }}
            />

            <div className="bg-zinc-900 border-t border-zinc-700 p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadSVG}
                className="flex-1 px-2 sm:px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors font-medium text-xs sm:text-sm"
              >
                SVG
              </button>
              <button
                onClick={downloadPNG}
                className="flex-1 px-2 sm:px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors font-medium text-xs sm:text-sm"
              >
                PNG
              </button>
            </div>
          </div>
        </div>

        {/* Quick Reference - Responsive */}
        <div className="mt-4 sm:mt-6 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
            Quick Reference
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <div>
              <p className="font-semibold text-purple-400 mb-2">Flowchart:</p>
              <code className="block bg-zinc-900 p-2 rounded text-xs overflow-auto">
                {`graph TD\nA[Start] --> B{Decision}\nB -->|Yes| C[End]`}
              </code>
            </div>
            <div>
              <p className="font-semibold text-purple-400 mb-2">Tree:</p>
              <code className="block bg-zinc-900 p-2 rounded text-xs overflow-auto">
                {`graph TD\nA[Root]\nA --> B[Child 1]\nA --> C[Child 2]`}
              </code>
            </div>
            <div>
              <p className="font-semibold text-purple-400 mb-2">Sequence:</p>
              <code className="block bg-zinc-900 p-2 rounded text-xs overflow-auto">
                {`sequenceDiagram\nA->>B: Hello\nB->>A: Hi`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowBook;
