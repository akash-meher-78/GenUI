import React, { useState, useEffect, useRef, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, ArrowUpRightFromSquareIcon, RefreshCw, Download } from "lucide-react";
import Navbar from "../components/Navbar";
import AceEditor from "react-ace";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";

function Generate() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { prompt, framework, skipGenerate, initialCode } = state || {};

    const [code, setCode] = useState(initialCode || "");
    const [loading, setLoading] = useState(!skipGenerate); // only show loader if generating
    const [refreshKey, setRefreshKey] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const progressInterval = useRef(null);

    useEffect(() => {
        if (skipGenerate) {
            setLoading(false);
            return;
        }

        if (!prompt) {
            navigate("/");
            return;
        }

        const generateCode = async () => {
            try {
                setLoading(true);
                setProgressPercent(5);
                setProgressStep("Analyzing prompt...");

                progressInterval.current = setInterval(() => {
                    setProgressPercent((p) => Math.min(95, p + Math.floor(Math.random() * 6) + 1));
                }, 500);

                const resp = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, framework: framework?.value }),
                });

                if (!resp.ok) throw new Error("Generation failed");

                const data = await resp.json();
                const match = data.code.match(/```(?:\w+)?\n?([\s\S]*?)```/);
                setCode(match ? match[1].trim() : data.code.trim());
            } catch (err) {
                console.error(err);
                toast.error("Failed to generate code");
            } finally {
                if (progressInterval.current) clearInterval(progressInterval.current);
                setProgressPercent(100);
                setProgressStep("Finalizing...");
                setTimeout(() => setLoading(false), 600);
                setTimeout(() => {
                    setProgressPercent(0);
                    setProgressStep("");
                }, 1000);
            }
        };

        generateCode();

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [prompt, framework, navigate, skipGenerate]);

    const copyCode = async () => {
        if (!code) return toast.error("No code to copy");
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard");
        } catch {
            toast.error("Failed to copy code");
        }
    };

    const iconSize = 24;

    return (
        <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--background-primary)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* Main Grid */}
            <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">
                {/* Code Editor */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--background-secondary)', border: '1px solid var(--btn-border)' }}>
                    <div className="flex justify-between items-center px-4 py-4 border-b border-[#333]">
                        <span className="font-mono font-bold text-lg">Code</span>
                        <div className="flex gap-5">
                                            <button onClick={copyCode} className="hover:text-sky-400  cursor-pointer" aria-label="Copy code">
                                                <Copy size={iconSize} />
                                            </button>
                                            <button onClick={() => {
                                                if (!code) return toast.error('No code to download');
                                                try {
                                                    const blob = new Blob([code], { type: 'text/html' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'Generated-Component.html';
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                    URL.revokeObjectURL(url);
                                                    toast.success('Downloaded');
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('Download failed');
                                                }
                                            }} className="hover:text-sky-400 cursor-pointer" aria-label="Download code">
                                                <Download size={iconSize} />
                                            </button>
                        </div>
                    </div>
                    <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading editor...</div>}>
                        <AceEditor
                            value={code}
                            mode="javascript"
                            theme="dracula"
                            width="100%"
                            height="80vh"
                            fontSize={16}
                            onChange={setCode}
                            setOptions={{ useWorker: false }}
                        />
                    </Suspense>
                </div>

                {/* Preview */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                    <div className="flex justify-between items-center px-4 py-4" style={{ background: 'var(--background-secondary)' }}>
                        <span className="font-bold font-mono text-lg">Preview</span>
                        <div className="flex gap-5">
                            <button onClick={() => setRefreshKey((k) => k + 1)} className="text-gray-600 hover:text-black cursor-pointer" aria-label="Refresh preview">
                                <RefreshCw size={iconSize} />
                            </button>
                            <button onClick={() => {
                                if (!code) return toast.error('Nothing to preview');
                                try {
                                    const newWin = window.open('', '_blank');
                                    if (!newWin) return toast.error('Unable to open new tab');
                                    newWin.document.open();
                                    newWin.document.write(code);
                                    newWin.document.close();
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to open preview');
                                }
                            }} className="text-gray-600 hover:text-black cursor-pointer" aria-label="Open preview in new tab">
                                <ArrowUpRightFromSquareIcon size={iconSize} />
                            </button>
                        </div>
                    </div>
                    <iframe
                        key={refreshKey}
                        srcDoc={code}
                        className="w-full h-[80vh]"
                        sandbox="allow-scripts"
                    />
                </div>
            </div>

            {/* Progress Bar Overlay */}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                    <ClipLoader color="#60a5fa" size={40} />
                    <p className="mt-4 text-white">{progressStep || "Starting..."}</p>
                    <div className="mt-3 w-80 bg-gray-800 h-3 rounded-full overflow-hidden">
                        <div
                            style={{ width: `${progressPercent}%` }}
                            className="h-3 bg-sky-500 transition-all duration-500"
                        ></div>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{progressPercent}%</p>
                </div>
            )}
        </div>
    );
}

export default Generate;
