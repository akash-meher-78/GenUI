import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Sparkles } from "lucide-react";
import Select from "react-select";

function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState({ value: "html-css-js", label: "HTML + CSS + JS" });

  const options = [
    { value: "html-css-bootstrap", label: "HTML + CSS + Bootstrap" },
    { value: "html-tailwind-js", label: "HTML + Tailwind CSS + JS" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "react-css", label: "React JS + CSS" },
  ];

  const themeStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--background-tertiary)",
      borderColor: state.isFocused ? "var(--accent)" : "var(--btn-border)",
      color: "var(--text-primary)",
      minHeight: "44px",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--background-secondary)",
      color: "var(--text-primary)",
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-secondary)" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "var(--accent)" : "transparent",
      color: state.isFocused ? "#ffffff" : "var(--text-primary)",
      cursor: "pointer",
    }),
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    navigate("/generate", { state: { prompt, framework } });
  };

  const handleOpenEditor = () => {
    navigate("/generate", {
      state: { skipGenerate: true, initialCode: "<!-- Start editing here -->", framework },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, var(--background-primary), var(--background-secondary))",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <div className="flex flex-col justify-center items-center flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">AI Component Generator</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Turn your ideas into ready-to-use components in seconds.
        </p>

        <div
          className="w-full max-w-2xl rounded-2xl p-6 shadow-xl"
          style={{
            background: "var(--background-secondary)",
            border: "1px solid var(--btn-border)",
          }}
        >
          <div className="mb-4 text-left">
            <label className="block text-sm mb-2 text-gray-400">Framework</label>
            <Select options={options} styles={themeStyles} value={framework} onChange={setFramework} />
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A responsive login form with gradient background..."
            className="w-full h-40 rounded-xl p-4 resize-none outline-none"
            style={{
              background: "var(--background-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--btn-border)",
            }}
          />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "1px solid transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Sparkles className="w-5 h-5" /> Generate
          </button>

          {/* Open Editor Button */}
          <button
            onClick={handleOpenEditor}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition cursor-pointer"
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-text)",
              border: "1px solid var(--btn-border)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--btn-hover-bg)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--btn-bg)")}
          >
            Open Editor
          </button>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 pb-4">
        Made with ❤️ by Akash
      </footer>
    </div>
  );
}

export default Home;
