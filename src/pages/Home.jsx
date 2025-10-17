import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import {
  ArrowUpRightFromSquareIcon,
  Code2Icon,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { CgExport } from "react-icons/cg";
import { IoCloseSharp } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

// 🧩 Fix Monaco define conflict
if (window.define && window.define.amd) {
  window.define = undefined;
  window.require = undefined;
}

const Editor = lazy(() => import("@monaco-editor/react"));

function Home() {
  const options = [
    { value: "html-css-bootstrap", label: "HTML + CSS + Bootstrap" },
    { value: "html-tailwind-js", label: "HTML + Tailwind CSS + JS" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "react-tailwind", label: "React JS + Tailwind CSS" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const progressInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // 🧠 Extract code safely from ``` blocks
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  // 🚀 Generate code from backend
  async function getResponse() {
    if (!prompt.trim()) return toast.error("Please describe your component first");

    try {
      setLoading(true);
      setOutputScreen(true);
      setProgressPercent(5);
      setProgressStep("Analyzing prompt");

      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
        setProgressPercent((p) => Math.min(95, p + Math.floor(Math.random() * 6) + 1));
      }, 700);

      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      const resp = await fetch(`${SERVER_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), framework: frameWork.value }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error("Generation error", err);
        toast.error(err?.error || "Generation failed on server");
        return;
      }

      const data = await resp.json();
      setCode(extractCode(data.code || ""));
      setOutputScreen(true);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while generating code");
    } finally {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgressPercent(100);
      setProgressStep("Finalizing");
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);
      setTimeout(() => {
        setProgressPercent(0);
        setProgressStep("");
      }, 400);
    }
  }

  // 📋 Copy code
  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  };

  // 💾 Download HTML file
  const downloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");

    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Generated-Component.html";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  // 🎨 Custom theme for react-select
  const themeStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--background-secondary)",
      borderColor: state.isFocused ? "#0EA5E9" : "rgba(255,255,255,0.15)",
      color: "var(--text-primary)",
      boxShadow: state.isFocused ? "0 0 0 2px #0EA5E9" : "none",
      "&:hover": { borderColor: "#0EA5E9" },
      minHeight: "40px",
      fontSize: "15px",
    }),
    input: (base) => ({ ...base, color: "var(--text-primary)" }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-secondary)" }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--background-tertiary)",
      color: "var(--text-primary)",
      border: "1px solid rgba(255,255,255,0.1)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#0ea5e966" : "transparent",
      color: state.isFocused ? "#ffffff" : "var(--text-primary)",
      cursor: "pointer",
    }),
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col md:flex-row items-start justify-between gap-5 px-5 sm:px-10 md:px-[100px] py-6">
        {/* 🧩 Left Section */}
        <div
          className="w-full md:w-1/2 rounded-2xl p-5 md:p-7"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <h3 className="text-xl font-semibold nav-text">AI Component Generator</h3>
          <p
            className="mt-2 text-base md:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Describe your component, and AI will generate it for you.
          </p>

          <p className="text-sm font-bold mt-4" style={{ color: "var(--text-secondary)" }}>
            Choose your Framework
          </p>
          <div className="mt-2">
            <Select
              options={options}
              styles={themeStyles}
              value={frameWork}
              onChange={(selected) => setFrameWork(selected)}
              placeholder="Select Framework..."
            />
          </div>

          <p className="text-sm font-bold mt-4" style={{ color: "var(--text-secondary)" }}>
            Describe Your Component
          </p>

          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className="w-full h-[200px] sm:h-[250px] mt-2 rounded-xl p-3 resize-none"
            style={{
              backgroundColor: "var(--background-tertiary)",
              color: "var(--text-primary)",
            }}
            placeholder="e.g., Responsive login form with inputs and gradient background"
          />

          <button
            onClick={getResponse}
            disabled={loading}
            className="flex items-center justify-center mt-3 px-6 py-2 rounded-lg border-0 cursor-pointer bg-gradient-to-r from-sky-400 to-indigo-500 hover:brightness-110 transition-all duration-500 font-mono text-lg ml-auto gap-2 w-full sm:w-auto"
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* 🧠 Right Section */}
        <div
          className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[80vh] rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-0 relative overflow-hidden"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          {!outputScreen ? (
            <>
              <div className="outputScreen w-[70px] h-[70px] rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 flex justify-center items-center">
                <Code2Icon className="w-10 h-10" />
              </div>
              <p className="text-base sm:text-xl mt-3" style={{ color: "var(--text-secondary)" }}>
                Your preview will appear here once ready.
              </p>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div className="top w-full h-17 flex items-center gap-3.5 px-5">
                <button
                  onClick={() => setTab(1)}
                  className={`tab-btn w-1/2 text-xl ${tab === 1 ? "tab-active" : ""}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`tab-btn w-1/2 text-xl ${tab === 2 ? "tab-active" : ""}`}
                >
                  Preview
                </button>
              </div>

              {/* Toolbar */}
              <div className="top w-full h-16 flex items-center justify-between gap-3.5 px-5">
                <p className="font-bold">Code Editor</p>
                <div className="flex items-center gap-2.5">
                  {tab === 1 ? (
                    <>
                      <button onClick={copyCode} className="tool-btn">
                        <Copy />
                      </button>
                      <button onClick={downloadFile} className="tool-btn">
                        <CgExport />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsNewTabOpen(true)} className="tool-btn">
                        <ArrowUpRightFromSquareIcon />
                      </button>
                      <button onClick={() => setRefreshKey((prev) => prev + 1)} className="tool-btn">
                        <RefreshCw />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="editor flex-1 min-h-0 w-full">
                {tab === 1 ? (
                  <Suspense
                    fallback={
                      <div className="text-gray-400 text-center py-10">Loading editor...</div>
                    }
                  >
                    <Editor
                      value={code}
                      height="100%"
                      theme="vs-dark"
                      language="html"
                      options={{ readOnly: true }}
                    />
                  </Suspense>
                ) : (
                  <iframe
                    key={refreshKey}
                    srcDoc={code}
                    className="w-full h-full bg-white text-black"
                    sandbox="allow-scripts"
                  ></iframe>
                )}
              </div>
            </>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-md text-center">
                <ClipLoader color="#a78bfa" size={40} />
                <p className="text-gray-300 mt-4">{progressStep || "Starting..."}</p>
                <div className="mt-3 w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-3 bg-sky-500 transition-all duration-500"
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-1">{progressPercent}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview */}
      {isNewTabOpen && (
        <div className="fixed inset-0 bg-white w-screen h-screen overflow-auto z-[9999]">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className="font-bold">Preview</p>
            <button
              onClick={() => setIsNewTabOpen(false)}
              className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200"
            >
              <IoCloseSharp />
            </button>
          </div>
          <iframe
            srcDoc={code}
            className="w-full h-[calc(100vh-60px)]"
            sandbox="allow-scripts"
          ></iframe>
        </div>
      )}
    </>
  );
}

export default Home;
