import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function NoPage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      style={{
        backgroundColor: "var(--background-primary)",
        color: "var(--text-primary)",
      }}
    >
      <h1 className="text-7xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-2xl mt-3 font-semibold">Page Not Found</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-lg border-0 bg-gradient-to-r from-sky-400 to-indigo-500 
        hover:brightness-110 transition-all duration-300 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back Home
      </button>
    </div>
  );
}

export default NoPage;
